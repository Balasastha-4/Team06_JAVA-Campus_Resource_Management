import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { Plus, Trash2, Calendar, X } from 'lucide-react';

const Resources = () => {
    const { user } = useAuth();
    const role = user?.roles?.[0] || 'STUDENT';
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [currentResourceId, setCurrentResourceId] = useState(null);

    // Form states
    const [newResource, setNewResource] = useState({ name: '', type: 'LAB', capacity: 30, status: 'AVAILABLE' });
    const [bookingData, setBookingData] = useState({ bookingDate: '', timeSlot: '' });

    const fetchResources = async () => {
        console.log(`Resources: fetchResources started for role: ${role}`);
        try {
            const res = await api.get('/resources');
            console.log("Resources: Data received:", res.data);
            setResources(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Resources: Failed to fetch data", error);
            setResources([]);
        } finally {
            setLoading(false);
            console.log("Resources: fetchResources finished");
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const openAddModal = () => {
        setIsEditing(false);
        setNewResource({ name: '', type: 'LAB', capacity: 30, status: 'AVAILABLE' });
        setShowAddModal(true);
    };

    const openEditModal = (resource) => {
        setIsEditing(true);
        setCurrentResourceId(resource.id);
        setNewResource({
            name: resource.name,
            type: resource.type,
            capacity: resource.capacity,
            status: resource.status
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/resources/${currentResourceId}`, newResource);
                toast.success('Resource updated successfully');
            } else {
                await api.post('/resources', newResource);
                toast.success('Resource added successfully');
            }
            setShowAddModal(false);
            fetchResources();
        } catch (error) {
            toast.error(error.response?.data || 'Failed to save resource');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/resources/${id}`);
            toast.success('Resource deleted');
            fetchResources();
        } catch (error) {
            toast.error('Failed to delete resource');
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bookings', {
                resourceId: selectedResource.id,
                bookingDate: bookingData.bookingDate,
                timeSlot: bookingData.timeSlot + ":00" // Append seconds for LocalTime
            });
            toast.success('Booking requested successfully');
            setShowBookModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Booking failed');
        }
    };

    const openBookModal = (resource) => {
        setSelectedResource(resource);
        setShowBookModal(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Campus Resources</h1>
                {
                    role === 'ADMIN' && (
                        <button
                            onClick={openAddModal}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Plus size={20} /> Add Resource
                        </button>
                    )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    resources.map(resource => (
                        <div key={resource.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{resource.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{resource.type}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${resource.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {resource.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Capacity: {resource.capacity}</p>
                                </div>
                                {role === 'ADMIN' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(resource)} className="text-blue-500 hover:text-blue-700">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(resource.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {(role === 'STUDENT' || role === 'STAFF' || role === 'HOD') && resource.status === 'AVAILABLE' && (
                                <button
                                    onClick={() => openBookModal(resource)}
                                    className="mt-4 w-full btn btn-secondary flex justify-center items-center gap-2"
                                >
                                    <Calendar size={16} /> Book Now
                                </button>
                            )}
                        </div>
                    ))}
            </div>

            {/* Add/Edit Resource Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">{isEditing ? 'Edit Resource' : 'Add New Resource'}</h3>
                                <button onClick={() => setShowAddModal(false)
                                }> <X /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input className="input-field" placeholder="Resource Name" required
                                    value={newResource.name} onChange={e => setNewResource({ ...newResource, name: e.target.value })} />

                                <select className="input-field" value={newResource.type} onChange={e => setNewResource({ ...newResource, type: e.target.value })}>
                                    <option value="LAB">Lab</option>
                                    <option value="CLASSROOM">Classroom</option>
                                    <option value="HALL">Hall</option>
                                    <option value="AUDITORIUM">Auditorium</option>
                                    <option value="GROUND">Ground</option>
                                    <option value="SEMINAR_HALL">Seminar Hall</option>
                                </select>

                                <select className="input-field" value={newResource.status} onChange={e => setNewResource({ ...newResource, status: e.target.value })}>
                                    <option value="AVAILABLE">Available</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                </select>

                                <input type="number" className="input-field" placeholder="Capacity" required min="1"
                                    value={newResource.capacity} onChange={e => setNewResource({ ...newResource, capacity: e.target.value })} />

                                <button type="submit" className="btn btn-primary w-full">{isEditing ? 'Update' : 'Create'}</button>
                            </form>
                        </div>
                    </div>
                )}

            {/* Booking Modal */}
            {
                showBookModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Book {selectedResource?.name}</h3>
                                <button onClick={() => setShowBookModal(false)
                                }> <X /></button>
                            </div>
                            <form onSubmit={handleBook} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input type="date" className="input-field" required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingData.bookingDate} onChange={e => setBookingData({ ...bookingData, bookingDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Time Slot</label>
                                    <input type="time" className="input-field" required
                                        value={bookingData.timeSlot} onChange={e => setBookingData({ ...bookingData, timeSlot: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary w-full">Request Booking</button>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default Resources;

