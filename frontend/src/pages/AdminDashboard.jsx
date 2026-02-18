import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import {
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    HelpCircle,
    Building2,
    BookOpen
} from 'lucide-react';

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

            // Refresh
            const [pendingEventsRes, pendingBookingsRes] = await Promise.all([
                api.get('/event-requests/pending'),
                api.get('/bookings/pending')
            ]);
            setData(prev => ({
                ...prev,
                pendingEvents: pendingEventsRes.data,
                pendingBookings: pendingBookingsRes.data
            }));
            alert(`${type} ${action}ed successfully!`);
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

    if (loading) return <div>Loading Admin Dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pending Bookings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="text-blue-500" />
                        Resource Requests
                    </h2>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {data.pendingBookings.length > 0 ? (
                            data.pendingBookings.map(b => (
                                <div key={b.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{b.resourceId}</p>
                                        <p className="text-xs text-gray-500">{b.bookingDate} | {b.timeSlot}</p>
                                        <p className="text-xs text-gray-400">User: {b.userId}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAction('bookings', b.id, 'approve', 'Booking')} className="text-green-600 hover:bg-green-100 p-1.5 rounded"><CheckCircle size={18} /></button>
                                        <button onClick={() => handleAction('bookings', b.id, 'reject', 'Booking')} className="text-red-600 hover:bg-red-100 p-1.5 rounded"><XCircle size={18} /></button>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-sm text-gray-400">No pending bookings.</p>}
                    </div>
                </div>

                {/* Pending Events */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="text-purple-500" />
                        Event Approvals
                    </h2>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {data.pendingEvents.length > 0 ? (
                            data.pendingEvents.map(e => (
                                <div key={e.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{e.eventName}</p>
                                        <p className="text-xs text-gray-500">{e.eventDate} | {e.department}</p>
                                        <StatusBadge status={e.status} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAction('event-requests', e.id, 'approve', 'Event')} className="text-green-600 hover:bg-green-100 p-1.5 rounded"><CheckCircle size={18} /></button>
                                        <button onClick={() => handleAction('event-requests', e.id, 'reject', 'Event')} className="text-red-600 hover:bg-red-100 p-1.5 rounded"><XCircle size={18} /></button>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-sm text-gray-400">No pending events.</p>}
                    </div>
                </div>
            </div>

            {/* Admin should also check Library Requests later */}
        </div>
    );
};

export default AdminDashboard;
