import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { Plus, MessageSquare } from 'lucide-react';

const Complaints = () => {
    const { user } = useAuth();
    const role = user?.roles?.[0] || 'STUDENT';
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [newComplaint, setNewComplaint] = useState({
        category: 'CLEANLINESS',
        description: '',
        location: '',
        routedTo: 'ADMIN',
        department: ''
    });

    const departments = [
        'Computer Science',
        'Information Technology',
        'Electronic & Communication',
        'Mechanical Engineering',
        'Civil Engineering',
        'Software Engineering',
        'Business Administration'
    ];

    const fetchComplaints = async () => {
        console.log(`Complaints: fetchComplaints started for role: ${role}`);
        try {
            const endpoint = (role === 'ADMIN' || role === 'HOD') ? '/complaints' : '/complaints/my';
            const res = await api.get(endpoint);
            console.log("Complaints: Data received:", res.data);
            setComplaints(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Complaints: Failed to fetch data", error);
            setComplaints([]);
        } finally {
            setLoading(false);
            console.log("Complaints: fetchComplaints finished");
        }
    };


    useEffect(() => {
        fetchComplaints();
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/complaints', newComplaint);
            toast.success('Complaint raised successfully');
            setShowModal(false);
            fetchComplaints();
        } catch (error) {
            toast.error('Failed to raise complaint');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`/complaints/${id}/update-status?status=${newStatus}`);
            toast.success('Status updated');
            fetchComplaints();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
                {
                    role === 'STUDENT' && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
                            <Plus size={20} /> Raise Complaint
                        </button>
                    )}
            </div>

            <div className="space-y-4">
                {
                    complaints.length > 0 ? complaints.map(complaint => (
                        <div key={complaint.id} className="card flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${complaint.category === 'SAFETY' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                        }`
                                    }>
                                        {complaint.category}
                                    </span>
                                    <span className="text-sm text-gray-500">• {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">
                                        To: {complaint.routedTo === 'HOD' ? `${complaint.department} HOD` : 'Admin'}
                                    </span>
                                </div>
                                <h3 className="font-medium text-gray-900">{complaint.description}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <span className="font-semibold">Location:</span> {complaint.location}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                    complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {complaint.status}
                                </div>

                                {(role === 'ADMIN' || role === 'HOD') && (
                                    <select
                                        className="input-field text-sm py-1 w-32"
                                        value={complaint.status}
                                        onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No complaints found.</p>
                            <p className="text-gray-400 text-sm mt-1">Great! No active issues to resolve.</p>
                        </div>
                    )}
            </div>

            {/* Raise Complaint Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">Raise New Complaint</h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <select className="input-field" value={newComplaint.category} onChange={e => setNewComplaint({ ...newComplaint, category: e.target.value })}>
                                    <option value="CLEANLINESS">Cleanliness</option>
                                    <option value="NOISE">Noise</option>
                                    <option value="FURNITURE">Furniture</option>
                                    <option value="ELECTRICITY">Electricity</option>
                                    <option value="WATER">Water</option>
                                    <option value="SAFETY">Safety</option>
                                </select>

                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        className="input-field"
                                        value={newComplaint.routedTo}
                                        onChange={e => setNewComplaint({ ...newComplaint, routedTo: e.target.value, department: e.target.value === 'ADMIN' ? '' : newComplaint.department })}
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="HOD">Dept HOD</option>
                                    </select>

                                    {newComplaint.routedTo === 'HOD' ? (
                                        <select
                                            className="input-field"
                                            required
                                            value={newComplaint.department}
                                            onChange={e => setNewComplaint({ ...newComplaint, department: e.target.value })}
                                        >
                                            <option value="">Select Dept</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="input-field bg-gray-50 flex items-center text-gray-400 text-sm">
                                            Admin Office
                                        </div>
                                    )}
                                </div>

                                <input className="input-field" placeholder="Location (e.g., Lab 2, Hallway)" required value={newComplaint.location} onChange={e => setNewComplaint({ ...newComplaint, location: e.target.value })} />

                                <textarea className="input-field h-24" placeholder="Describe the issue..." required value={newComplaint.description} onChange={e => setNewComplaint({ ...newComplaint, description: e.target.value })}></textarea>

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

export default Complaints;

