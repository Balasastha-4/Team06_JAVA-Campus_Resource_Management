import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("Attempting login with:", email, password);
            const success = await login(email, password);
            console.log("Login result:", success);
            if (success) {
                toast.success('Logged in successfully!');
                console.log("Navigating to dashboard...");
                navigate('/dashboard');
            } else {
                console.error("Login returned false/undefined");
                toast.error("Login failed: No token received.");
            }
        } catch (error) {
            console.error("Login error caught in component:", error);
            let errorMessage = 'Invalid email or password';

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl" />

            <div className="max-w-md w-full mx-4 relative z-10">
                <div className="glass-effect p-10 rounded-3xl shadow-2xl border border-white/40">
                    <div className="text-center mb-10">
                        <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 mb-6 transform transition-transform hover:scale-110 duration-300">
                            <LogIn size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-slate-500 font-medium">Please sign in to your account</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input-field"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="btn btn-primary w-full py-3.5 text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                            >
                                Sign In
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                                Contact Admin
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-400 text-xs font-semibold uppercase tracking-widest">
                    Campus Resource Management System
                </p>
            </div>
        </div>
    );
};

export default Login;

