import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, ClipboardCheck, User,
    Bell, LogOut, Menu, X, ChevronRight, GraduationCap
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import axios from 'axios';

const StudentLayout = ({ children }) => {
    const { user: authUser, token } = useSelector((state) => state.auth);
    const [user, setUser] = useState(authUser);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            // Reusing teacher profile endpoint as it returns common school/user info
            // or we could have a student-specific one if needed.
            const res = await axios.get('http://localhost:2000/school/teacher/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
        } catch (error) {
            console.error("Profile fetch error:", error);
        }
    };

    const navLinks = [
        { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/student/exams', label: 'Available Exams', icon: BookOpen },
        { path: '/student/results', label: 'My Results', icon: ClipboardCheck },
        { path: '/student/profile', label: 'My Profile', icon: User },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const currentLabel = navLinks.find(i => location.pathname === i.path)?.label || 'Dashboard';

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 selection:bg-indigo-500/30">

            {/* Mobile backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* School Logo Section */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30 overflow-hidden shrink-0">
                            {user?.schoolLogo ? (
                                <img src={user.schoolLogo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <BookOpen className="text-indigo-400" size={20} />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-black text-white truncate uppercase tracking-tighter italic">
                                {user?.schoolName || 'CBT System'}
                            </h2>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest italic">Student Portal</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} />
                                {link.label}
                                {isActive && <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info Footer */}
                <div className="p-4 border-t border-white/5 bg-slate-900/40">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-black text-indigo-400 italic">{user?.fullName?.charAt(0) || 'S'}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-white truncate italic leading-none mb-1">{user?.fullName || 'Student'}</p>
                            <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-widest">{user?.info?.registrationNumber || 'No ID'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-rose-500/20"
                    >
                        <LogOut size={14} />
                        Logout Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white transition-colors p-1">
                            <Menu size={22} />
                        </button>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500 hidden md:inline">Student</span>
                            <ChevronRight size={14} className="text-slate-600 hidden md:inline" />
                            <span className="text-slate-200 font-semibold">{currentLabel}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                             <p className="text-xs font-bold text-slate-200 leading-none">{user?.info?.classLevel || 'Class'}</p>
                             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1 italic">Active Session</p>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full relative transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-slate-900"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
