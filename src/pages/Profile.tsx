import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-dark-100">
                    My <span className="gradient-text">Profile</span>
                </h1>
                <p className="text-dark-400 mt-2">View your account details.</p>
            </div>

            <div className="glass-card p-8">
                {/* Avatar header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-dark-700/50">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-primary-600/20">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-dark-100">{user.name}</h2>
                        <p className="text-dark-400 mt-1">{user.email}</p>
                        <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-500/15 text-purple-400' : 'bg-primary-500/15 text-primary-400'
                                }`}>
                                {user.role}
                            </span>
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${user.status === 'approved'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : user.status === 'pending'
                                        ? 'bg-amber-500/15 text-amber-400'
                                        : 'bg-red-500/15 text-red-400'
                                }`}>
                                {user.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                    <div className="p-5 rounded-xl bg-dark-800/50 border border-dark-700/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary-500/15 text-primary-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                            <p className="text-dark-400 text-sm font-medium">Full Name</p>
                        </div>
                        <p className="text-dark-100 font-medium">{user.name}</p>
                    </div>

                    <div className="p-5 rounded-xl bg-dark-800/50 border border-dark-700/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary-500/15 text-primary-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            </div>
                            <p className="text-dark-400 text-sm font-medium">Email Address</p>
                        </div>
                        <p className="text-dark-100 font-medium">{user.email}</p>
                    </div>

                    <div className="p-5 rounded-xl bg-dark-800/50 border border-dark-700/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary-500/15 text-primary-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <p className="text-dark-400 text-sm font-medium">Account Role</p>
                        </div>
                        <p className="text-dark-100 font-medium capitalize">{user.role}</p>
                    </div>

                    <div className="p-5 rounded-xl bg-dark-800/50 border border-dark-700/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary-500/15 text-primary-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            </div>
                            <p className="text-dark-400 text-sm font-medium">Member Since</p>
                        </div>
                        <p className="text-dark-100 font-medium">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
