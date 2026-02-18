import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    HelpCircle,
    BookOpen,
    AlertCircle
} from 'lucide-react';

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

    const StatusBadge = ({ status }) => {
        let color = 'bg-gray-100 text-gray-800';
        let Icon = HelpCircle;
        if (status === 'APPROVED' || status === 'VERIFIED' || status === 'ISSUED') { color = 'bg-green-100 text-green-800'; Icon = CheckCircle; }
        else if (status.includes('PENDING') || status === 'OPEN') { color = 'bg-yellow-100 text-yellow-800'; Icon = Clock; }
        else if (status === 'REJECTED') { color = 'bg-red-100 text-red-800'; Icon = XCircle; }

        return (
            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                <Icon size={12} /> {status.replace('_', ' ')}
            </span>
        );
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'User'}</h1>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* My Events */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Calendar className="text-purple-500" /> My Events</h2>
                    <div className="space-y-3">
                        {data.myEvents.map(e => (
                            <div key={e.id} className="p-2 border-b last:border-0 border-gray-100 flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{e.eventName}</p>
                                        <p className="text-xs text-gray-500">{e.eventDate}</p>
                                    </div>
                                    <StatusBadge status={e.status} />
                                </div>
                                {e.status === 'REJECTED' && e.rejectionReason && (
                                    <p className="text-xs text-red-600 bg-red-50 p-1 rounded mt-1 border border-red-100 italic">
                                        <strong>Reason:</strong> {e.rejectionReason}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Borrow Requests */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen className="text-blue-500" /> Library</h2>
                    <div className="space-y-3">
                        {data.borrowRequests.map(b => (
                            <div key={b.id} className="flex justify-between items-center p-2 border-b last:border-0 border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">{b.book?.title || 'Book Request'}</p>
                                    <p className="text-xs text-gray-500">{new Date(b.requestDate).toLocaleDateString()}</p>
                                </div>
                                <StatusBadge status={b.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
