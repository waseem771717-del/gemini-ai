interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'indigo' | 'emerald' | 'amber' | 'rose';
    subtitle?: string;
}

const colorMap = {
    indigo: {
        bg: 'from-indigo-500/20 to-indigo-600/10',
        border: 'border-indigo-500/20',
        icon: 'text-indigo-400 bg-indigo-500/15',
        text: 'text-indigo-300',
    },
    emerald: {
        bg: 'from-emerald-500/20 to-emerald-600/10',
        border: 'border-emerald-500/20',
        icon: 'text-emerald-400 bg-emerald-500/15',
        text: 'text-emerald-300',
    },
    amber: {
        bg: 'from-amber-500/20 to-amber-600/10',
        border: 'border-amber-500/20',
        icon: 'text-amber-400 bg-amber-500/15',
        text: 'text-amber-300',
    },
    rose: {
        bg: 'from-rose-500/20 to-rose-600/10',
        border: 'border-rose-500/20',
        icon: 'text-rose-400 bg-rose-500/15',
        text: 'text-rose-300',
    },
};

export default function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
    const c = colorMap[color];

    return (
        <div
            className={`glass-card bg-gradient-to-br ${c.bg} border ${c.border} p-6 hover:scale-[1.02] transition-transform duration-300`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-dark-400 text-sm font-medium">{title}</p>
                    <p className={`text-3xl font-bold mt-2 ${c.text}`}>{value}</p>
                    {subtitle && <p className="text-dark-500 text-xs mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl ${c.icon}`}>{icon}</div>
            </div>
        </div>
    );
}
