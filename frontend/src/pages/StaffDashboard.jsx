import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    BookOpen,
    AlertCircle,
    ArrowRight,
    UserCheck,
    Briefcase
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const StaffDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState({
        pendingEvents: [],
        myBookings: [],
        borrowRequests: [],
        activeEvents: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activeEventsRes, pendingEventsRes, bookingsRes, borrowsRes] = await Promise.all([
                    api.get('/event-requests/active'),
                    api.get('/event-requests/pending'),
                    api.get('/bookings/my'),
                    api.get('/borrow-request/my')
                ]);

                setData({
                    activeEvents: activeEventsRes.data,
                    pendingEvents: pendingEventsRes.data,
                    myBookings: bookingsRes.data,
                    borrowRequests: borrowsRes.data
                });
            } catch (error) {
                console.error("Error fetching Staff dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEventAction = async (id, action) => {
        try {
            let reason = null;
            if (action === 'reject') {
                reason = prompt("Please provide a reason for rejection (e.g., 'Not available at this time'):");
                if (reason === null) return;
            }

            const url = `/event-requests/${id}/${action}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`;
            await api.patch(url);

            const res = await api.get('/event-requests/pending');
            setData(prev => ({ ...prev, pendingEvents: res.data }));
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff Portal</h1>
                    <p className="text-slate-500 font-medium mt-1">Workspace for <span className="text-primary font-bold">{user?.name}</span></p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <Briefcase size={18} className="text-primary" />
                        <span className="text-sm font-bold text-slate-700">Faculty Staff</span>
                    </div>
                </div>
            </header>

            {/* Event Confirmation - Urgent Notification */}
            {data.pendingEvents.length > 0 && (
                <section>
                    <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 md:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <div className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30">
                                    <UserCheck size={24} />
                                </div>
                                Confirm Supervisions
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.pendingEvents.map(e => (
                                    <div key={e.id} className="bg-white p-6 rounded-3xl border border-primary/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-extrabold text-lg text-slate-900 mb-2">{e.eventName}</h3>
                                            <p className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                                                <Calendar size={14} /> {e.eventDate}
                                            </p>
                                            <p className="text-xs font-bold text-primary mt-4 uppercase tracking-widest">Organized by {e.userId}</p>
                                        </div>
                                        <div className="flex gap-3 mt-8">
                                            <button
                                                onClick={() => handleEventAction(e.id, 'approve')}
                                                className="btn btn-primary flex-1 py-3 text-sm"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => handleEventAction(e.id, 'reject')}
                                                className="btn btn-secondary flex-1 py-3 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* My Bookings */}
                <div className="card group">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Calendar size={24} />
                            </div>
                            My Bookings
                        </h2>
                        <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">Overview</span>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.myBookings.length > 0 ? data.myBookings.map(b => (
                            <div key={b.id} className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-md transition-all flex justify-between items-center group/item">
                                <span className="font-bold text-slate-900 group-hover/item:text-primary transition-colors">{b.resourceId}</span>
                                <StatusBadge status={b.status} />
                            </div>
                        )) : <p className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl">No bookings found.</p>}
                    </div>
                </div>

                {/* Library Requests */}
                <div className="card group">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <BookOpen size={24} />
                            </div>
                            Library Activity
                        </h2>
                        <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">History</span>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.borrowRequests.length > 0 ? data.borrowRequests.map(b => (
                            <div key={b.id} className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-md transition-all flex justify-between items-center group/item">
                                <span className="font-bold text-slate-900 group-hover/item:text-primary transition-colors">{b.bookId}</span>
                                <StatusBadge status={b.status} />
                            </div>
                        )) : <p className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl">No library activity.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
