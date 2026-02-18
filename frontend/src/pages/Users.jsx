import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Plus, UserX, UserCheck, Edit2 } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ACTIVE');
    const [showModal, setShowModal] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'STUDENT',
        department: '',
        password: '' // Optional for edit
    });

    const [errors, setErrors] = useState({});

    // 10 digits strictly
    const PHONE_REGEX = /^\d{10}$/;
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;

    const validateField = (name, value) => {
        let error = '';
        if (name === 'phone') {
            if (!PHONE_REGEX.test(value)) {
                error = 'Phone number must be exactly 10 digits.';
            }
        }
        if (name === 'password') {
            // Logic: Password is required for NEW users. Optional for EDITing users (empty means no change).
            // If Editing AND password is empty -> No error.
            // If Editing AND password provided -> Validate.
            // If Creating -> Password Required -> Validate.

            if (isEditing && value === '') return ''; // Allow empty password on edit

            if (!PASSWORD_REGEX.test(value)) {
                error = 'Password must be at least 8 chars, with 1 uppercase, 1 lowercase, 1 number, and 1 special char.';
            }
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
        if (name === 'phone' || name === 'password') {
            validateField(name, value);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get(`/users/filter?status=${statusFilter}`);
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [statusFilter]);

    // Open Modal for Create
    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentUserId(null);
        setNewUser({ name: '', email: '', phone: '', role: 'STUDENT', department: '', password: '' });
        setErrors({});
        setShowModal(true);
    }

    // Open Modal for Edit
    const openEditModal = (user) => {
        setIsEditing(true);
        setCurrentUserId(user.id);
        setNewUser({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            department: user.department || '',
            password: '' // Empty means no change
        });
        setErrors({});
        setShowModal(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final Validation check
        const phoneError = validateField('phone', newUser.phone);
        const passError = validateField('password', newUser.password);

        if (phoneError || passError) {
            toast.error("Please fix the errors before submitting.");
            return;
        }

        try {
            if (isEditing) {
                await api.put(`/users/${currentUserId}`, newUser);
                toast.success('User updated successfully');
            } else {
                await api.post('/users', newUser);
                toast.success('User created successfully');
            }
            setShowModal(false);
            openCreateModal(); // Reset
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save user');
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('User deactivated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to deactivate user');
        }
    };

    const handleActivate = async (id) => {
        try {
            await api.patch(`/users/${id}/status`, JSON.stringify("ACTIVE"), {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success('User activated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to activate user: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
                <div className="flex gap-4">
                    <select
                        className="input-field py-1"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                        <Plus size={20} /> Add User
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.department || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                                                user.role === 'HOD' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        <div className="text-sm text-gray-500">{user.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900 ml-4" title="Edit User">
                                            <Edit2 size={18} />
                                        </button>
                                        {
                                            user.status === 'ACTIVE' ? (
                                                <button onClick={() => handleDeactivate(user.id)} className="text-red-600 hover:text-red-900 ml-4" title="Deactivate User">
                                                    <UserX size={18} />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleActivate(user.id)} className="text-green-600 hover:text-green-900 ml-4" title="Activate User">
                                                    <UserCheck size={18} />
                                                </button>
                                            )
                                        }
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit User Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <input className="input-field w-full" name="name" placeholder="Full Name" required value={newUser.name} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <input className="input-field w-full" name="email" placeholder="Email" required type="email" value={newUser.email} onChange={handleInputChange} />
                                </div>

                                <div>
                                    <input
                                        className={`input-field w-full ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        name="phone"
                                        placeholder="Phone (10 digits)"
                                        required
                                        value={newUser.phone}
                                        onChange={handleInputChange}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                <select name="role" className="input-field w-full" value={newUser.role} onChange={handleInputChange}>
                                    <option value="STUDENT">Student</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="HOD">HOD</option>
                                    <option value="ADMIN">Admin</option>
                                </select>

                                <select
                                    name="department"
                                    className="input-field w-full"
                                    value={newUser.department}
                                    onChange={handleInputChange}
                                    required={newUser.role !== 'ADMIN'}
                                >
                                    <option value="">Select Department</option>
                                    <option value="IT">IT</option>
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="MECH">MECH</option>
                                    <option value="CIVIL">CIVIL</option>
                                </select>

                                <div>
                                    <input
                                        className={`input-field w-full ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        name="password"
                                        placeholder={isEditing ? "New Password (Leave blank to keep current)" : "Password (Strong)"}
                                        required={!isEditing}
                                        type="password"
                                        value={newUser.password}
                                        onChange={handleInputChange}
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button type="button" onClick={() => { setShowModal(false); setErrors({}); }} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={!!errors.phone || !!errors.password}>{isEditing ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Users;

