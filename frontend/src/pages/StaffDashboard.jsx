import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    HelpCircle,
    BookOpen
} from 'lucide-react';

const StaffDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState({
        pendingEvents: [], // Events assigned to staff for confirmation
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
                    pendingEvents: pendingEventsRes.data, // Should be filtered by backend for STAFF role
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
                if (reason === null) return; // User cancelled the prompt
            }

            const url = `/event-requests/${id}/${action}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`;
            await api.patch(url);

            const res = await api.get('/event-requests/pending');
            setData(prev => ({ ...prev, pendingEvents: res.data }));
            alert(`Event ${action === 'approve' ? 'confirmed' : 'declined'} successfully!`);
        } catch (error) {
            console.error("Action failed", error);
            alert("Action failed: " + (error.response?.data || error.message));
        }
    };

    const StatusBadge = ({ status }) => {
        let color = 'bg-gray-100 text-gray-800';
        let Icon = HelpCircle;
        if (status === 'APPROVED' || status === 'VERIFIED') { color = 'bg-green-100 text-green-800'; Icon = CheckCircle; }
        else if (status.includes('PENDING')) { color = 'bg-yellow-100 text-yellow-800'; Icon = Clock; }
        else if (status === 'REJECTED') { color = 'bg-red-100 text-red-800'; Icon = XCircle; }

        return (
            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                <Icon size={12} /> {status.replace('_', ' ')}
            </span>
        );
    };

    if (loading) return <div>Loading Staff Dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>

            {/* Event Confirmation */}
            {data.pendingEvents.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Confirm Event In-Charge</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.pendingEvents.map(e => (
                            <div key={e.id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{e.eventName}</h3>
                                    <p className="text-sm text-gray-600">{e.eventDate} | Organized by {e.userId}</p>
                                    <p className="text-xs text-blue-600">Please confirm you will supervise this event.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEventAction(e.id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Confirm</button>
                                    <button onClick={() => handleEventAction(e.id, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* My Bookings */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold mb-4">My Bookings</h2>
                    <div className="space-y-3">
                        {data.myBookings.map(b => (
                            <div key={b.id} className="flex justify-between p-2 border-b">
                                <span>{b.resourceId}</span>
                                <StatusBadge status={b.status} />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Library Requests */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen size={20} /> Library Requests</h2>
                    <div className="space-y-3">
                        {data.borrowRequests.map(b => (
                            <div key={b.id} className="flex justify-between p-2 border-b">
                                <span>{b.bookId}</span>
                                <StatusBadge status={b.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
