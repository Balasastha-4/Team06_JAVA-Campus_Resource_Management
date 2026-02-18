import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { Plus, Check, X, Calendar } from 'lucide-react';

const Events = () => {
    const { user } = useAuth();
    const role = user?.roles?.[0] || 'STUDENT';
    const department = user?.department || '';

    const [events, setEvents] = useState([]);
    const [resources, setResources] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [newEvent, setNewEvent] = useState({
        eventName: '',
        eventType: 'WORKSHOP',
        resourceId: '',
        eventDate: '',
        timeSlot: '', // String like "10:00"
        participants: 10,
        description: '',
        staffInChargeId: ''
    });

    const fetchData = async () => {
        console.log(`Events: fetchData started for role: ${role}`);
        try {
            const promises = [
                api.get(role === 'STUDENT' ? '/event-requests/my' : '/event-requests/pending'),
                api.get('/resources')
            ];

            if (role === 'STUDENT' && department) {
                console.log(`Events: Fetching staff for department: ${department}`);
                promises.push(api.get(`/users/staff/${department}`));
            }

            const results = await Promise.all(promises);
            console.log("Events: Data received:", {
                events: results[0].data,
                resources: results[1].data,
                staff: results[2]?.data
            });

            setEvents(Array.isArray(results[0].data) ? results[0].data : []);
            setResources(Array.isArray(results[1].data) ? results[1].data : []);

            if (role === 'STUDENT' && department && results[2]) {
                const fetchedStaff = Array.isArray(results[2].data) ? results[2].data : [];
                console.log(`Events: Fetched ${fetchedStaff.length} staff members for ${department}`);
                setStaffList(fetchedStaff);

                if (fetchedStaff.length === 0) {
                    console.warn(`Events: No staff found for department "${department}". Check backend mapping.`);
                }
            }

            if (results[1].data.length > 0) {
                setNewEvent(prev => ({ ...prev, resourceId: results[1].data[0].id }));
            }
        } catch (error) {
            console.error("Events: Failed to fetch data", error);
            setEvents([]);
            setResources([]);
        } finally {
            setLoading(false);
            console.log("Events: fetchData finished");
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [role, department, user?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/event-requests', {
                ...newEvent,
                department: department, // Auto-fill from user session
                timeSlot: newEvent.timeSlot + ":00" // Backend expects LocalTime HH:mm:ss
            });
            toast.success('Event request submitted');
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data || 'Failed to submit request');
        }
    };

    const handleVote = async (id, status) => {
        try {
            const endpoint = status === 'APPROVED' ? 'approve' : 'reject';
            await api.patch(`/event-requests/${id}/${endpoint}`);
            toast.success(`Event ${status.toLowerCase()}`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data || 'Action failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Events</h1>
                {
                    role === 'STUDENT' && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
                            <Plus size={20} /> Request Event
                        </button>
                    )}
            </div>

            <div className={`grid grid-cols-1 ${events.length > 0 ? 'lg:grid-cols-2' : ''} gap-6`}>
                {
                    events.length > 0 ? events.map(event => (
                        <div key={event.id} className="card border-l-4 border-l-primary">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{event.eventName}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <Calendar size={14} />
                                        {event.eventDate} at {event.timeSlot}
                                    </p>
                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-2 inline-block">
                                        {event.eventType}
                                    </span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    event.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {event.status}
                                </span>
                            </div>

                            <p className="mt-3 text-gray-600 text-sm">{event.description}</p>
                            <p className="mt-1 text-xs text-gray-400">Participants: {event.participants}</p>

                            {event.status === 'REJECTED' && event.rejectionReason && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-700 flex items-start gap-2">
                                    <X size={16} className="mt-0.5 shrink-0" />
                                    <span><strong>Reason:</strong> {event.rejectionReason}</span>
                                </div>
                            )}

                            {(role === 'STAFF' || role === 'ADMIN' || role === 'HOD') && event.status === 'PENDING' && (
                                <div className="mt-4 flex gap-2 justify-end border-t pt-3">
                                    <button onClick={() => handleVote(event.id, 'REJECTED')} className="btn btn-secondary text-red-600 hover:bg-red-50">
                                        <X size={16} /> Reject
                                    </button>
                                    <button onClick={() => handleVote(event.id, 'APPROVED')} className="btn btn-primary bg-green-600 hover:bg-green-700">
                                        <Check size={16} /> Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No events found.</p>
                            <p className="text-gray-400 text-sm mt-1">Check back later for new event requests.</p>
                        </div>
                    )}
            </div>

            {/* Event Request Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-bold mb-4">Request Event</h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input className="input-field" placeholder="Event Name" required value={newEvent.eventName} onChange={e => setNewEvent({ ...newEvent, eventName: e.target.value })} />

                                <div className="grid grid-cols-2 gap-3">
                                    <select className="input-field" value={newEvent.eventType} onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value })}>
                                        <option value="WORKSHOP">Workshop</option>
                                        <option value="SEMINAR">Seminar</option>
                                        <option value="CULTURAL">Cultural</option>
                                        <option value="SPORTS">Sports</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    <input type="number" className="input-field" placeholder="Participants" required min="1" value={newEvent.participants} onChange={e => setNewEvent({ ...newEvent, participants: e.target.value })} />
                                </div>

                                <label className="block text-sm font-medium text-gray-700">Resource</label>
                                <select className="input-field" value={newEvent.resourceId} onChange={e => setNewEvent({ ...newEvent, resourceId: e.target.value })}>
                                    {
                                        resources.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
                                        ))
                                    }
                                </select>

                                <div className="grid grid-cols-2 gap-3">
                                    <input type="date" className="input-field" required min={new Date().toISOString().split('T')[0]} value={newEvent.eventDate} onChange={e => setNewEvent({ ...newEvent, eventDate: e.target.value })} />
                                    <input type="time" className="input-field" required value={newEvent.timeSlot} onChange={e => setNewEvent({ ...newEvent, timeSlot: e.target.value })} />
                                </div>

                                <label className="block text-sm font-medium text-gray-700">Staff In-Charge</label>
                                <select
                                    className="input-field"
                                    required
                                    value={newEvent.staffInChargeId}
                                    onChange={e => setNewEvent({ ...newEvent, staffInChargeId: e.target.value })}
                                >
                                    <option value="">Select Staff</option>
                                    {
                                        staffList.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                                        ))
                                    }
                                </select>

                                <textarea className="input-field h-24" placeholder="Description" required value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}></textarea>

                                <div className="flex gap-3 justify-end">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Events;

