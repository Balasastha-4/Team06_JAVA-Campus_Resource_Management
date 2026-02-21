import { CheckCircle, Clock, XCircle, HelpCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
    let config = {
        color: 'bg-slate-100 text-slate-600 border-slate-200',
        Icon: HelpCircle
    };

    const s = status?.toUpperCase() || '';

    if (s === 'APPROVED' || s === 'VERIFIED' || s === 'ISSUED' || s === 'SUCCESS') {
        config = { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', Icon: CheckCircle };
    } else if (s.includes('PENDING') || s === 'OPEN' || s === 'PROCESSING') {
        config = { color: 'bg-amber-50 text-amber-700 border-amber-100', Icon: Clock };
    } else if (s === 'REJECTED' || s === 'CANCELLED' || s === 'FAILED') {
        config = { color: 'bg-rose-50 text-rose-700 border-rose-100', Icon: XCircle };
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${config.color}`}>
            <config.Icon size={14} className="stroke-[2.5]" />
            {s.replace('_', ' ')}
        </span>
    );
};

export default StatusBadge;
