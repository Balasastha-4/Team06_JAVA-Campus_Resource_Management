import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'STUDENT',
        department: '',
        password: ''
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
            if (!PASSWORD_REGEX.test(value)) {
                error = 'Password must be at least 8 chars, with 1 uppercase, 1 lowercase, 1 number, and 1 special char.';
            }
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'phone' || name === 'password') {
            validateField(name, value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final Validation check
        const phoneError = validateField('phone', formData.phone);
        const passError = validateField('password', formData.password);

        if (phoneError || passError) {
            toast.error("Please fix the errors before submitting.");
            return;
        }

        try {
            await register(formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            // Error handled by toast in context or global handler, but we can add specific handling here
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Registration failed.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <UserPlus size={24} />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or <Link to="/login" className="font-medium text-primary hover:text-blue-500">sign in to existing account</Link>
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <input
                            name="name"
                            type="text"
                            required
                            className="input-field"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <input
                            name="email"
                            type="email"
                            required
                            className="input-field"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <div>
                            <input
                                name="phone"
                                type="text"
                                required
                                className={`input-field w-full ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="Phone Number (10 digits)"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1 text-left">{errors.phone}</p>}
                        </div>

                        <select
                            name="role"
                            className="input-field"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="STAFF">Staff</option>
                            {/* Admin registration usually restricted, but allowed here for demo setup */}
                            <option value="ADMIN">Admin</option>
                            <option value="HOD">HOD</option>
                        </select>
                        <select
                            name="department"
                            className="input-field"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Electronic & Communication">Electronic & Communication</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                        </select>

                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className={`input-field w-full ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="Password (Strong)"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1 text-left">{errors.password}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;

