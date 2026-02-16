import { useAuth } from '../contexts/AuthContext';

export default function AwaitingApproval() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-lg relative animate-fade-in text-center">
                <div className="glass-card p-10">
                    {/* Clock icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/15 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>

                    {user?.status === 'rejected' ? (
                        <>
                            <h1 className="text-3xl font-bold text-red-400 mb-3">Account Rejected</h1>
                            <p className="text-dark-400 text-lg mb-2">
                                Sorry, your account has been rejected by an administrator.
                            </p>
                            <p className="text-dark-500 text-sm">
                                Please contact support if you believe this is a mistake.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-amber-300 mb-3">Awaiting Approval</h1>
                            <p className="text-dark-400 text-lg mb-2">
                                Your account is pending admin approval.
                            </p>
                            <p className="text-dark-500 text-sm">
                                You&apos;ll be able to access the dashboard once an administrator approves your account.
                            </p>
                        </>
                    )}

                    <div className="mt-8 pt-6 border-t border-dark-700/50">
                        <p className="text-dark-500 text-sm mb-4">
                            Signed in as <span className="text-dark-300">{user?.email}</span>
                        </p>
                        <button
                            onClick={logout}
                            className="px-6 py-2.5 rounded-xl text-sm font-medium text-dark-300 border border-dark-600 hover:bg-dark-700/50 transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
