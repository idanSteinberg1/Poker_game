import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Users, Plus, Play } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Table {
    id: number;
    name: string;
    club_id: number;
    status: 'active' | 'closed';
}

const ClubLobby = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tables, setTables] = useState<Table[]>([]);
    const [isCreateTableModalOpen, setCreateTableModalOpen] = useState(false);

    const [club, setClub] = useState<{ name: string; code: string } | null>(null);

    // Create Table Form
    const { register, handleSubmit, reset } = useForm<{ name: string }>();

    useEffect(() => {
        if (id) {
            fetchTables();
            fetchClubDetails();
        }
    }, [id]);

    const fetchClubDetails = async () => {
        try {
            const { data } = await api.get(`/clubs/${id}`);
            setClub(data);
        } catch (error) {
            console.error('Failed to fetch club details', error);
        }
    };

    const fetchTables = async () => {
        try {
            const { data } = await api.get(`/tables/${id}`);
            setTables(data);
        } catch (error) {
            console.error('Failed to fetch tables', error);
        }
    };

    const onCreateTable = async (data: { name: string }) => {
        try {
            await api.post('/tables/create', { ...data, clubId: id });
            fetchTables();
            setCreateTableModalOpen(false);
            reset();
        } catch (error) {
            console.error('Failed to create table', error);
        }
    };

    const copyToClipboard = () => {
        if (club?.code) {
            navigator.clipboard.writeText(club.code);
            alert(`Club code ${club.code} copied!`);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')}>&larr; Back</Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {club?.name || 'Club Lobby'}
                        </h1>
                        {club && (
                            <div className="flex items-center gap-2 bg-neutral-800/50 px-3 py-1 rounded-lg border border-white/10 w-fit">
                                <span className="text-neutral-400 text-sm">Code:</span>
                                <code className="text-yellow-400 font-mono font-bold tracking-wider">{club.code}</code>
                                <button
                                    onClick={copyToClipboard}
                                    className="ml-2 hover:bg-white/10 p-1.5 rounded-md transition-colors group"
                                    title="Copy Club Code"
                                >
                                    <span className="text-xs group-hover:text-white text-neutral-400">📋</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <Button onClick={() => setCreateTableModalOpen(true)} className="gap-2">
                    <Plus size={18} /> New Table
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                        <div className="flex justify-center mb-4">
                            <div className="bg-neutral-800 p-4 rounded-full">
                                <Users size={32} className="text-neutral-500" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-300 mb-2">No Active Tables</h3>
                        <p className="text-neutral-500">Create a table to start playing Flips.</p>
                    </div>
                ) : (
                    tables.map((table) => (
                        <Card key={table.id} className="hover:border-green-500/50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{table.name}</h3>
                                <div className="px-2 py-1 rounded text-xs font-bold uppercase bg-neutral-900 text-neutral-400">
                                    5 Seats
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-8">
                                <div className="text-sm text-neutral-500">
                                    Status: <span className="text-green-400">Active</span>
                                </div>
                                <Button size="sm" className="bg-green-600 hover:bg-green-500" onClick={() => navigate(`/game/${table.id}`)}>
                                    Sit Down <Play size={16} className="ml-2 fill-current" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Modal isOpen={isCreateTableModalOpen} onClose={() => setCreateTableModalOpen(false)} title="Create New Table">
                <form onSubmit={handleSubmit(onCreateTable)} className="space-y-4">
                    <Input
                        label="Table Name"
                        placeholder="e.g. High Rollers"
                        registration={register('name', { required: true })}
                        autoFocus
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setCreateTableModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Table</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ClubLobby;
