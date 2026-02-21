import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import {
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    ClipboardList,
    Users as UsersIcon,
    ArrowRight,
    Building2,
    ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

const HODDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState({
        pendingEvents: [],
        staffAvailability: [],
        departmentRequirements: [],
        myBookings: [],
        activeEvents: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activeEventsRes, pendingEventsRes, pendingBookingsRes, myBookingsRes] = await Promise.all([
                    api.get('/event-requests/active'),
                    api.get('/event-requests/pending'),
                    api.get('/bookings/pending'),
                    api.get('/bookings/my')
                ]);

                setData({
                    activeEvents: activeEventsRes.data,
                    pendingEvents: pendingEventsRes.data,
                    pendingBookings: pendingBookingsRes.data,
                    myBookings: myBookingsRes.data,
                    staffAvailability: [],
                    departmentRequirements: []
                });
            } catch (error) {
                console.error("Error fetching HOD dashboard", error);
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
                reason = prompt("Please provide a reason for rejection:");
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

    const handleBookingAction = async (id, action) => {
        try {
            await api.patch(`/bookings/${id}/${action}`);
            const res = await api.get('/bookings/pending');
            setData(prev => ({ ...prev, pendingBookings: res.data }));
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

    const totalActions = (data.pendingEvents?.length || 0) + (data.pendingBookings?.length || 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dept. Overview</h1>
                    <p className="text-slate-500 font-medium mt-1">Managing <span className="text-primary font-bold">{user?.department || 'Department'}</span> Resources</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-primary" />
                        <span className="text-sm font-bold text-slate-700">HOD Portal</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Actions Card */}
                <div className="card lg:col-span-2 group">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <AlertCircle size={24} />
                            </div>
                            Approval Queue
                        </h2>
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-xs font-bold">
                            {totalActions} Pending
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Events Sub-section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Events</h3>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {data.pendingEvents?.length > 0 ? data.pendingEvents.map(event => (
                                    <div key={event.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all group/item">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 group-hover/item:text-primary transition-colors">{event.eventName}</p>
                                                <p className="text-[10px] font-semibold text-slate-500 mt-1">{event.eventDate}</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button onClick={() => handleEventAction(event.id, 'approve')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button onClick={() => handleEventAction(event.id, 'reject')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-xs text-slate-400 italic py-4 pl-1">No pending event requests.</p>}
                            </div>
                        </div>

                        {/* Resources Sub-section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Resources</h3>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {data.pendingBookings?.length > 0 ? data.pendingBookings.map(booking => (
                                    <div key={booking.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all group/item">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 group-hover/item:text-primary transition-colors">{booking.resourceId}</p>
                                                <p className="text-[10px] font-semibold text-slate-500 mt-1">{booking.bookingDate} • {booking.timeSlot}</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button onClick={() => handleBookingAction(booking.id, 'approve')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button onClick={() => handleBookingAction(booking.id, 'reject')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-xs text-slate-400 italic py-4 pl-1">No pending resource requests.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Dept Requirements Link */}
                    <Link to="/department/requirements" className="card group hover:shadow-xl transition-all border-l-4 border-l-primary flex flex-col justify-between">
                        <div>
                            <div className="p-3 bg-indigo-50 text-primary rounded-2xl w-fit mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <ClipboardList size={28} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-2">Dept. Needs</h2>
                            <p className="text-sm font-medium text-slate-500">Analyze and manage resource requirements for your faculty.</p>
                        </div>
                        <div className="mt-8 flex items-center text-primary font-bold text-sm gap-2">
                            Go to Management <ArrowRight size={16} />
                        </div>
                    </Link>

                    {/* Quick Stats Placeholder */}
                    <div className="card bg-slate-900 text-white border-0 shadow-lg shadow-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <UsersIcon size={20} className="text-indigo-300" />
                            </div>
                            <h3 className="font-bold">Staff Stats</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <p className="text-xs font-bold text-indigo-300 uppercase tracking-tighter">Availability</p>
                                <p className="text-2xl font-black mt-1">84%</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <p className="text-xs font-bold text-indigo-300 uppercase tracking-tighter">Utilization</p>
                                <p className="text-2xl font-black mt-1">62%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Events Banner */}
            <section>
                <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <Calendar className="text-white" size={24} />
                            </div>
                            Happening Now
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.activeEvents?.length > 0 ? (
                                data.activeEvents.map(event => (
                                    <div key={event.id} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                                        <h3 className="font-extrabold text-xl leading-tight mb-3">{event.eventName}</h3>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
                                            <Clock size={16} />
                                            <span>{event.eventDate} • {event.timeSlot}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 font-medium italic">No events currently active.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HODDashboard;
