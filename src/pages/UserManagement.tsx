import { useEffect, useState } from 'react';
import { User } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

type Tab = 'pending' | 'all';

export default function UserManagement() {
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, [activeTab]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'pending' ? '/users/pending' : '/users';
            const data = await apiFetch<{ users: User[] }>(endpoint);
            setUsers(data.users);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await apiFetch(`/users/${id}/approve`, { method: 'PUT' });
            await loadUsers();
        } catch (err) {
            console.error('Failed to approve user:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            await apiFetch(`/users/${id}/reject`, { method: 'PUT' });
            await loadUsers();
        } catch (err) {
            console.error('Failed to reject user:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        setActionLoading(id);
        try {
            await apiFetch(`/users/${id}`, { method: 'DELETE' });
            await loadUsers();
        } catch (err) {
            console.error('Failed to delete user:', err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-dark-100">
                    User <span className="gradient-text">Management</span>
                </h1>
                <p className="text-dark-400 mt-2">Manage user accounts and approval requests.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-dark-800/50 rounded-xl border border-dark-700/50 w-fit">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                            : 'text-dark-400 hover:text-dark-200'
                        }`}
                >
                    Pending Approval
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'all'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                            : 'text-dark-400 hover:text-dark-200'
                        }`}
                >
                    All Users
                </button>
            </div>

            {/* Users table */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-dark-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-dark-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" y1="11" x2="23" y2="11" />
                        </svg>
                        <p className="font-medium">No {activeTab === 'pending' ? 'pending' : ''} users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-700/50">
                                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">User</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Joined</th>
                                    <th className="text-right px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-dark-100">{u.name}</p>
                                                    <p className="text-xs text-dark-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-500/15 text-purple-400' : 'bg-primary-500/15 text-primary-400'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.status === 'approved'
                                                    ? 'bg-emerald-500/15 text-emerald-400'
                                                    : u.status === 'pending'
                                                        ? 'bg-amber-500/15 text-amber-400'
                                                        : 'bg-red-500/15 text-red-400'
                                                }`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-dark-400">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {u.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(u.id)}
                                                            disabled={actionLoading === u.id}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(u.id)}
                                                            disabled={actionLoading === u.id}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        disabled={actionLoading === u.id}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-700/50 text-dark-400 hover:bg-red-500/15 hover:text-red-400 transition-colors disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
