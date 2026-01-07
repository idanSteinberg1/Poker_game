import { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useForm } from 'react-hook-form';

interface Log {
    id: number;
    username: string;
    club_id: number;
    amount: number;
    type: string;
    description: string;
    timestamp: string;
}

interface User {
    id: number;
    username: string;
    role: string;
}

const AdminPage = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Deposit Form
    const { register, handleSubmit, reset } = useForm<{ userId: number; clubId: number; amount: number }>();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [logsRes, usersRes] = await Promise.all([
                api.get('/admin/logs'),
                api.get('/admin/users')
            ]);
            setLogs(logsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error('Admin fetch error', err);
        }
    };

    const onDeposit = async (data: any) => {
        setIsLoading(true);
        try {
            await api.post('/admin/chips', data);
            reset();
            fetchData();
            alert('Chips added successfully!');
        } catch (err) {
            alert('Failed to add chips');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Deposit Panel */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Manual Deposit</h2>
                    <form onSubmit={handleSubmit(onDeposit)} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">User</label>
                            <select {...register('userId')} className="w-full bg-gray-700 p-2 rounded text-white">
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                                ))}
                            </select>
                        </div>

                        {/* 
                           Ideally fetch Clubs to select. 
                           For now assume Club 1 or let admin type ID. 
                           Most systems have 1 Global Club or user specific.
                           Let's hardcode Club ID Input for now.
                        */}
                        <Input
                            label="Club ID"
                            type="number"
                            {...register('clubId', { valueAsNumber: true })}
                        />

                        <Input
                            label="Amount"
                            type="number"
                            {...register('amount', { valueAsNumber: true })}
                        />

                        <Button isLoading={isLoading} className="w-full bg-green-600 hover:bg-green-500">
                            Add Chips
                        </Button>
                    </form>
                </div>

                {/* Users List */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-h-96 overflow-auto">
                    <h2 className="text-xl font-bold mb-4">Active Logs</h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-400">
                                <th className="p-2">Time</th>
                                <th className="p-2">User</th>
                                <th className="p-2">Type</th>
                                <th className="p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="border-b border-gray-700">
                                    <td className="p-2 text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                    <td className="p-2">{log.username}</td>
                                    <td className="p-2 text-xs uppercase text-gray-400">{log.type}</td>
                                    <td className={`p-2 text-right font-bold ${log.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {log.amount > 0 ? '+' : ''}{log.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
