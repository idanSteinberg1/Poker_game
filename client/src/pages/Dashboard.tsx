import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Plus, Users, ArrowRight, Coins } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Club {
    id: number;
    name: string;
    code: string;
    role: string;
    balance: number;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    // Create Club Form
    const { register: registerCreate, handleSubmit: handleCreateSubmit, reset: resetCreate } = useForm<{ name: string }>();

    // Join Club Form
    const { register: registerJoin, handleSubmit: handleJoinSubmit, reset: resetJoin } = useForm<{ code: string }>();

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        try {
            const { data } = await api.get('/clubs/my');
            setClubs(data);
        } catch (error) {
            console.error('Failed to fetch clubs', error);
        } finally {
            setLoading(false);
        }
    };

    const onCreateClub = async (data: { name: string }) => {
        try {
            await api.post('/clubs/create', data);
            fetchClubs();
            setIsCreateModalOpen(false);
            resetCreate();
        } catch (error) {
            console.error(error);
            alert('Failed to create club');
        }
    };

    const onJoinClub = async (data: { code: string }) => {
        try {
            await api.post('/clubs/join', data);
            fetchClubs();
            setIsJoinModalOpen(false);
            resetJoin();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to join club');
        }
    };

    const onLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    My Clubs
                </h1>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={onLogout}>Logout</Button>
                    <Button onClick={() => setIsJoinModalOpen(true)}>Join Club</Button>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                        <Plus size={18} /> Create Club
                    </Button>
                </div>
            </header>

            {loading ? (
                <div className="text-center text-gray-500 py-20">Loading clubs...</div>
            ) : clubs.length === 0 ? (
                <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                    <Users size={48} className="mx-auto text-neutral-600 mb-4" />
                    <h3 className="text-xl font-bold text-neutral-300 mb-2">No Clubs Yet</h3>
                    <p className="text-neutral-500 mb-6">Join an existing club or create your own to start playing.</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="secondary" onClick={() => setIsJoinModalOpen(true)}>Join Club</Button>
                        <Button onClick={() => setIsCreateModalOpen(true)}>Create Club</Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubs.map((club) => (
                        <Card key={club.id} onClick={() => navigate(`/club/${club.id}`)} className="hover:border-blue-500/50 transition-colors group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{club.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded">Code: {club.code}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(club.code);
                                                alert(`Code ${club.code} copied!`);
                                            }}
                                            className="p-1 hover:bg-white/10 rounded transition-colors text-neutral-500 hover:text-white"
                                            title="Copy Code"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${club.role === 'manager' || club.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {club.role}
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-8">
                                <div>
                                    <div className="text-sm text-neutral-400 flex items-center gap-1">Balance</div>
                                    <div className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                                        <Coins size={24} className="fill-yellow-500/20" />
                                        ${club.balance.toLocaleString()}
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">
                                    Enter <ArrowRight size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Club">
                <form onSubmit={handleCreateSubmit(onCreateClub)} className="space-y-4">
                    <Input
                        label="Club Name"
                        placeholder="e.g. Friday Night Poker"
                        registration={registerCreate('name', { required: true })}
                        autoFocus
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Club</Button>
                    </div>
                </form>
            </Modal>

            {/* Join Modal */}
            <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title="Join Existing Club">
                <form onSubmit={handleJoinSubmit(onJoinClub)} className="space-y-4">
                    <Input
                        label="Club Code"
                        placeholder="e.g. X9Y2Z1"
                        registration={registerJoin('code', { required: true })}
                        autoFocus
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Join Club</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;
