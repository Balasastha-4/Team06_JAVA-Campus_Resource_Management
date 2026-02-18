import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import {
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    ClipboardList,
    HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
                // Parallel fetch for HOD
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
            alert(`Event ${action === 'approve' ? 'verified' : 'rejected'} successfully!`);
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
            alert(`Booking ${action === 'approve' ? 'verified' : 'rejected'} successfully!`);
        } catch (error) {
            console.error("Action failed", error);
            alert("Action failed: " + (error.response?.data || error.message));
        }
    };

    const StatusBadge = ({ status }) => {
        // ... (StatusBadge component logic)
        let color = 'bg-gray-100 text-gray-800';
        let Icon = HelpCircle;

        if (status === 'APPROVED' || status === 'VERIFIED') {
            color = 'bg-green-100 text-green-800';
            Icon = CheckCircle;
        } else if (status.includes('PENDING')) {
            color = 'bg-yellow-100 text-yellow-800';
            Icon = Clock;
        } else if (status === 'REJECTED') {
            color = 'bg-red-100 text-red-800';
            Icon = XCircle;
        }

        return (
            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                <Icon size={12} />
                {status.replace('_', ' ')}
            </span>
        );
    };

    if (loading) return <div>Loading Dashboard...</div>;

    const totalActions = (data.pendingEvents?.length || 0) + (data.pendingBookings?.length || 0);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Department Dashboard ({user?.department || 'N/A'})</h1>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Pending Actions Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="text-orange-500" />
                            Pending Actions
                        </h2>
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {totalActions}
                        </span>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Events ({data.pendingEvents?.length || 0})</h3>
                        {data.pendingEvents?.length > 0 ? (
                            data.pendingEvents.map(event => (
                                <div key={event.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{event.eventName}</p>
                                            <p className="text-xs text-gray-500">{event.eventDate} | {event.userId}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEventAction(event.id, 'approve')} className="text-green-600 hover:bg-green-50 p-1 rounded" title="Approve">
                                                <CheckCircle size={16} />
                                            </button>
                                            <button onClick={() => handleEventAction(event.id, 'reject')} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Reject">
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-xs text-gray-400 italic">No pending event requests.</p>}

                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Resources ({data.pendingBookings?.length || 0})</h3>
                        {data.pendingBookings?.length > 0 ? (
                            data.pendingBookings.map(booking => (
                                <div key={booking.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{booking.resourceId}</p>
                                            <p className="text-xs text-gray-500">{booking.bookingDate} | {booking.timeSlot} | {booking.userId}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleBookingAction(booking.id, 'approve')} className="text-green-600 hover:bg-green-50 p-1 rounded" title="Verify">
                                                <CheckCircle size={16} />
                                            </button>
                                            <button onClick={() => handleBookingAction(booking.id, 'reject')} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Reject">
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-xs text-gray-400 italic">No pending resource requests.</p>}
                    </div>
                </div>

                {/* Staff Status Summary (Placeholder) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Users className="text-blue-500" />
                            Staff Status
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500">Feature coming soon...</p>
                </div>

                {/* Dept Requirements Link */}
                <Link to="/department/requirements" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow block">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="text-purple-500" />
                            Dept. Needs
                        </h2>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Manage</span>
                    </div>
                    <p className="text-sm text-gray-500">Manage resource and staff requirements.</p>
                </Link>
            </div>

            {/* Active Events Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="text-white" />
                    Happening Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.activeEvents?.length > 0 ? (
                        data.activeEvents.map(event => (
                            <div key={event.id} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                <h3 className="font-bold text-lg">{event.eventName}</h3>
                                <p className="text-sm opacity-90">{event.eventDate} | {event.timeSlot}</p>
                            </div>
                        ))
                    ) : <p className="text-white/80 italic">No events currently active.</p>}
                </div>
            </div>
        </div>
    );
};

export default HODDashboard;
