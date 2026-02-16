import { useEffect, useState } from 'react';
import { useAuth, User } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import StatsCard from '../components/StatsCard';

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'admin') {
            loadAdminData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadAdminData = async () => {
        try {
            const [statsData, usersData] = await Promise.all([
                apiFetch<{ stats: Stats }>('/users/stats'),
                apiFetch<{ users: User[] }>('/users'),
            ]);
            setStats(statsData.stats);
            setRecentUsers(usersData.users.slice(0, 5));
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Regular user dashboard
    if (user?.role !== 'admin') {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-dark-100">
                        Welcome, <span className="gradient-text">{user?.name}</span>
                    </h1>
                    <p className="text-dark-400 mt-2">Here is your dashboard overview.</p>
                </div>

                <div className="glass-card p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-dark-100">{user?.name}</h2>
                            <p className="text-dark-400">{user?.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50">
                            <p className="text-dark-400 text-sm">Role</p>
                            <p className="text-dark-100 font-medium capitalize mt-1">{user?.role}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50">
                            <p className="text-dark-400 text-sm">Status</p>
                            <p className="text-emerald-400 font-medium capitalize mt-1">{user?.status}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 sm:col-span-2">
                            <p className="text-dark-400 text-sm">Member Since</p>
                            <p className="text-dark-100 font-medium mt-1">
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Admin dashboard
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-dark-100">
                    Admin <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-dark-400 mt-2">Overview of your platform statistics.</p>
            </div>

            {/* Stats grid */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatsCard
                        title="Total Users"
                        value={stats.total}
                        color="indigo"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        }
                    />
                    <StatsCard
                        title="Pending"
                        value={stats.pending}
                        color="amber"
                        subtitle="Awaiting approval"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        }
                    />
                    <StatsCard
                        title="Approved"
                        value={stats.approved}
                        color="emerald"
                        subtitle="Active users"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        }
                    />
                    <StatsCard
                        title="Rejected"
                        value={stats.rejected}
                        color="rose"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        }
                    />
                </div>
            )}

            {/* Recent users table */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-dark-700/50">
                    <h2 className="text-lg font-semibold text-dark-100">Recent Users</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-700/50">
                                <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">User</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Role</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-dark-400 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map((u) => (
                                <tr key={u.id} className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
