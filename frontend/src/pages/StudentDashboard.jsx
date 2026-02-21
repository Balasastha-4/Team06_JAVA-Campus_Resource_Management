import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import {
    Calendar,
    BookOpen,
    AlertCircle,
    ArrowRight,
    Star,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState({
        myBookings: [],
        borrowRequests: [],
        myEvents: [],
        myComplaints: [],
        activeEvents: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activeEventsRes, bookingRes, borrowRes, eventsRes, complaintsRes] = await Promise.all([
                    api.get('/event-requests/active'),
                    api.get('/bookings/my'),
                    api.get('/borrow-request/my'),
                    api.get('/event-requests/my'),
                    api.get('/complaints/my')
                ]);

                setData({
                    activeEvents: activeEventsRes.data,
                    myBookings: bookingRes.data,
                    borrowRequests: borrowRes.data,
                    myEvents: eventsRes.data,
                    myComplaints: complaintsRes.data
                });
            } catch (error) {
                console.error("Error fetching Student dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Hey, <span className="text-primary">{user?.name?.split(' ')[0] || 'there'}!</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Here's what's happening on campus today.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <Star size={18} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-slate-700">Student Portal</span>
                    </div>
                </div>
            </header>

            {/* Active Events Banner */}
            <section>
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-primary-dark rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-20 -mb-20 blur-2xl" />

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <span className="p-2 bg-white/20 rounded-xl">
                                <Calendar className="text-white" size={24} />
                            </span>
                            Happening Now
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.activeEvents?.length > 0 ? (
                                data.activeEvents.map(event => (
                                    <div key={event.id} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer group/event">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-extrabold text-xl leading-tight">{event.eventName}</h3>
                                            <ArrowRight size={20} className="opacity-0 group-hover/event:opacity-100 transition-all -translate-x-4 group-hover/event:translate-x-0" />
                                        </div>
                                        <div className="flex items-center gap-2 text-indigo-100 text-sm font-semibold">
                                            <Clock size={16} />
                                            <span>{event.eventDate}</span>
                                            <span className="mx-1">•</span>
                                            <span>{event.timeSlot}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-6 text-indigo-100/60 font-medium italic flex items-center gap-2">
                                    <AlertCircle size={20} />
                                    No events currently active.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* My Events */}
                <div className="card group">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Calendar size={24} />
                            </div>
                            My Events
                        </h2>
                        <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">Overview</span>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.myEvents.length > 0 ? data.myEvents.map(e => (
                            <div key={e.id} className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-md transition-all group/item">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-900 group-hover/item:text-primary transition-colors">{e.eventName}</p>
                                        <p className="text-xs font-semibold text-slate-500">{e.eventDate}</p>
                                    </div>
                                    <StatusBadge status={e.status} />
                                </div>
                                {e.status === 'REJECTED' && e.rejectionReason && (
                                    <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
                                        <p className="text-xs text-rose-700 font-medium italic flex gap-2">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span>{e.rejectionReason}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl">No events requested yet.</p>
                        )}
                    </div>
                </div>

                {/* My Borrow Requests */}
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
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 group-hover/item:text-primary transition-colors">{b.book?.title || 'Book Request'}</p>
                                    <p className="text-xs font-semibold text-slate-500">{new Date(b.requestDate).toLocaleDateString()}</p>
                                </div>
                                <StatusBadge status={b.status} />
                            </div>
                        )) : (
                            <p className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl">No library activity found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
