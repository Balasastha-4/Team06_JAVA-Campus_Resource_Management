import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { Plus, CheckCircle, XCircle, Archive } from 'lucide-react';

const DepartmentRequirements = () => {
    const { user } = useAuth();
    const role = user.roles[0];
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [newReq, setNewReq] = useState({
        type: 'RESOURCE',
        description: ''
    });

    const fetchRequirements = async () => {
        try {
            const endpoint = role === 'ADMIN' ? '/department-requirements/all' : '/department-requirements/my-department';
            const res = await api.get(endpoint);
            setRequirements(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequirements();
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/department-requirements', newReq);
            toast.success('Requirement added successfully');
            setShowModal(false);
            setNewReq({ type: 'RESOURCE', description: '' });
            fetchRequirements();
        } catch (error) {
            toast.error('Failed to add requirement');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/department-requirements/${id}/status`, { status }); // Sending object as body, controller expects RequestBody?
            // Controller: @RequestBody RequirementStatus status. 
            // If it's an enum, Spring Boot might expect a string if configured, or a JSON object if it's a wrapper?
            // The controller signature is: public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody RequirementStatus status)
            // RequirementStatus is an Enum. 
            // Spring Boot usually expects just the string in quotes if it's the root body for an enum, OR we can send it as a string with proper Content-Type.
            // Let's try sending the string directly, but axios defaults to JSON.
            // If the controller expects just the enum, passing JSON string "APPROVED" might work.
            // Let's check how api.patch sends data.
            // Actually, for @RequestBody Enum, sending a JSON string (with quotes) usually works.

            // Wait, if I pass { status: "APPROVED" }, that matches a POJO with a status field.
            // But here request body IS the enum.
            // So I should pass just the string "APPROVED"?
            // Axios will serialize it. 
            // If I pass "APPROVED", axios sends "APPROVED".
            // Let's safe-guard and assume I should pass it wrapped if I can change the backend, but I can't easily change backend structure without rebuild.
            // The Controller expects `RequirementStatus`. 
            // I'll try sending the string wrapped in quotes as the body.

            await api.patch(`/department-requirements/${id}/status`, JSON.stringify(status), {
                headers: { 'Content-Type': 'application/json' }
            });

            toast.success('Status updated');
            fetchRequirements();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading Requirements...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Department Requirements</h1>
                {role === 'HOD' && (
                    <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
                        <Plus size={20} /> Add Requirement
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {requirements.length === 0 ? <p className="text-gray-500">No requirements found.</p> : requirements.map(req => (
                    <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${req.type === 'RESOURCE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                    }`}>
                                    {req.type}
                                </span>
                                {(role === 'ADMIN') && <span className="text-sm font-semibold text-gray-700">{req.department}</span>}
                                <span className="text-xs text-gray-500">• {new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-1 text-gray-900 font-medium">{req.description}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        req.status === 'FULFILLED' ? 'bg-gray-100 text-gray-800' :
                                            'bg-yellow-100 text-yellow-800'
                                }`}>
                                {req.status}
                            </span>

                            {role === 'ADMIN' && req.status === 'PENDING' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleStatusUpdate(req.id, 'APPROVED')} className="btn p-1 text-green-600 hover:bg-green-50" title="Approve">
                                        <CheckCircle size={20} />
                                    </button>
                                    <button onClick={() => handleStatusUpdate(req.id, 'REJECTED')} className="btn p-1 text-red-600 hover:bg-red-50" title="Reject">
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            )}
                            {role === 'ADMIN' && req.status === 'APPROVED' && (
                                <button onClick={() => handleStatusUpdate(req.id, 'FULFILLED')} className="btn p-1 text-gray-600 hover:bg-gray-50" title="Mark Fulfilled">
                                    <Archive size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">Add Requirement</h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <select className="input-field w-full" value={newReq.type} onChange={e => setNewReq({ ...newReq, type: e.target.value })}>
                                    <option value="RESOURCE">Resource</option>
                                    <option value="STAFF">Staff</option>
                                </select>

                                <textarea className="input-field w-full h-24" placeholder="Describe requirements..." required value={newReq.description} onChange={e => setNewReq({ ...newReq, description: e.target.value })}></textarea>

                                <div className="flex gap-3 justify-end mt-4">
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

export default DepartmentRequirements;
