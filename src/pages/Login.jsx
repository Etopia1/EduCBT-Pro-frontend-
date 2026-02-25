import { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const res = await axios.post('http://localhost:2000/auth/login', credentials);
            dispatch(loginSuccess(res.data));
            const user = res.data.user;
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'school_admin') navigate('/school/dashboard');
            else if (user.role === 'teacher') navigate('/teacher/dashboard');
            else if (user.role === 'student') navigate('/student/dashboard');
            else navigate('/login');
        } catch (err) {
            dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
            {/* Background glows */}
            <div
                className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(-30%, -30%)' }}
            />
            <div
                className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #a855f7, transparent)', transform: 'translate(30%, 30%)' }}
            />
            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Back to home */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Home
            </button>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4">
                        <GraduationCap size={28} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-2xl tracking-tight">
                        EduCBT <span className="text-indigo-400">Pro</span>
                    </span>
                    <p className="text-slate-400 text-sm mt-1">Secondary School CBT Platform</p>
                </div>

                {/* Form card */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                        <p className="text-slate-400 text-sm">Sign in to your school portal</p>
                    </div>

                    {error && (
                        <div className="mb-5 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                            <span className="shrink-0">⚠</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Login ID */}
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Login ID</label>
                            <input
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                placeholder="e.g. SCH-123, TCH-456, STD-789"
                                required
                                autoComplete="username"
                                className="w-full bg-slate-900/70 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all duration-200"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={credentials.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full bg-slate-900/70 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 text-sm outline-none transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 text-sm mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer links */}
                    <div className="mt-6 pt-6 border-t border-slate-700/50 text-center space-y-2">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/register-school')}
                                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                                Register your school
                            </button>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;

