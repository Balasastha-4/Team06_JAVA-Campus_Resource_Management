import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Building2,
    Users as UsersIcon,
    ArrowRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState({
        pendingEvents: [],
        pendingBookings: [],
        activeEvents: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activeEventsRes, pendingEventsRes, pendingBookingsRes] = await Promise.all([
                    api.get('/event-requests/active'),
                    api.get('/event-requests/pending'),
                    api.get('/bookings/pending')
                ]);

                setData({
                    activeEvents: activeEventsRes.data,
                    pendingEvents: pendingEventsRes.data,
                    pendingBookings: pendingBookingsRes.data
                });
            } catch (error) {
                console.error("Error fetching Admin dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAction = async (endpoint, id, action, type) => {
        try {
            let reason = null;
            if (action === 'reject' && endpoint === 'event-requests') {
                reason = prompt(`Please provide a reason for ${type} rejection:`);
                if (reason === null) return;
            }

            const url = `/${endpoint}/${id}/${action}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`;
            await api.patch(url);

            const [pendingEventsRes, pendingBookingsRes] = await Promise.all([
                api.get('/event-requests/pending'),
                api.get('/bookings/pending')
            ]);
            setData(prev => ({
                ...prev,
                pendingEvents: pendingEventsRes.data,
                pendingBookings: pendingBookingsRes.data
            }));
        } catch (error) {
            console.error("Action failed", error);
            alert("Action failed: " + (error.response?.data || error.message));
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage campus resources and event approvals</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <UsersIcon size={18} className="text-primary" />
                        <span className="text-sm font-bold text-slate-700">Administrator</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Bookings */}
                <div className="card group">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Building2 size={24} />
                            </div>
                            Resource Requests
                        </h2>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                            {data.pendingBookings.length} Pending
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.pendingBookings.length > 0 ? (
                            data.pendingBookings.map(b => (
                                <div key={b.id} className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-md transition-all group/item flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-900 group-hover/item:text-primary transition-colors">{b.resourceId}</p>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                            <span>{b.bookingDate}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span>{b.timeSlot}</span>
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-2">Requested by {b.userId}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction('bookings', b.id, 'approve', 'Booking')}
                                            className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors bg-white shadow-sm border border-slate-100"
                                            title="Approve"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAction('bookings', b.id, 'reject', 'Booking')}
                                            className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors bg-white shadow-sm border border-slate-100"
                                            title="Reject"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-3">
                                    <Building2 size={32} />
                                </div>
                                <p className="text-sm font-medium text-slate-500">All resource requests cleared!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Events */}
                <div className="card group">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Calendar size={24} />
                            </div>
                            Event Approvals
                        </h2>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                            {data.pendingEvents.length} Pending
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.pendingEvents.length > 0 ? (
                            data.pendingEvents.map(e => (
                                <div key={e.id} className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-md transition-all group/item flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-900 group-hover/item:text-primary transition-colors">{e.eventName}</p>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                            <span>{e.eventDate}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span className="text-purple-600">{e.department}</span>
                                        </div>
                                        <div className="mt-3">
                                            <StatusBadge status={e.status} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction('event-requests', e.id, 'approve', 'Event')}
                                            className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors bg-white shadow-sm border border-slate-100"
                                            title="Approve"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAction('event-requests', e.id, 'reject', 'Event')}
                                            className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors bg-white shadow-sm border border-slate-100"
                                            title="Reject"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-3">
                                    <Calendar size={32} />
                                </div>
                                <p className="text-sm font-medium text-slate-500">No events pending approval.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
