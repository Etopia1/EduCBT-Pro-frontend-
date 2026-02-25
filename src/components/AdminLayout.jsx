import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, GraduationCap, FileQuestion, ClipboardCheck,
    Calendar, MoreHorizontal, LogOut, Menu, X, Settings, UserCheck,
    CreditCard, MessageSquare, ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/school/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/school/approvals', label: 'Approvals', icon: UserCheck },
        { path: '/school/teachers', label: 'Teachers', icon: Users },
        { path: '/school/students', label: 'Students', icon: GraduationCap },
        { path: '/school/exams', label: 'Exams', icon: FileQuestion },
        { path: '/school/results', label: 'Results', icon: ClipboardCheck },
        { path: '/school/events', label: 'Events', icon: Calendar },
        { path: '/school/community', label: 'Staff Community', icon: MessageSquare },
        { path: '/school/subscription', label: 'Subscription', icon: CreditCard },
        { path: '/school/result-template', label: 'Result Template', icon: FileQuestion },
        { path: '/school/others', label: 'Others', icon: MoreHorizontal },
        { path: '/school/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const currentLabel = menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard';

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans">

            {/* Mobile backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ───────────────────────────────────────────── */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                bg-slate-900/80 backdrop-blur-xl border-r border-white/5
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0
            `}>
                {/* Logo / School */}
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                    {user?.schoolLogo ? (
                        <img src={user.schoolLogo} alt="logo" className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30" />
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/30">
                            {user?.schoolName?.charAt(0) || 'A'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.schoolName || 'Admin Panel'}</p>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">School Admin</p>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                                    ${isActive
                                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                    }
                                `}
                            >
                                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                                <span className="text-sm font-medium flex-1">{item.label}</span>
                                {isActive && <ChevronRight size={14} className="text-indigo-400 opacity-60" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                            {user?.fullName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-200 truncate">{user?.fullName || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all text-sm font-medium"
                    >
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Main content ──────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

                {/* Top bar */}
                <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
                        >
                            <Menu size={22} />
                        </button>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500 hidden md:inline">Dashboard</span>
                            {location.pathname !== '/school/dashboard' && (
                                <>
                                    <ChevronRight size={14} className="text-slate-600 hidden md:inline" />
                                    <span className="text-slate-200 font-semibold">{currentLabel}</span>
                                </>
                            )}
                            {location.pathname === '/school/dashboard' && (
                                <span className="text-slate-200 font-semibold md:hidden">{currentLabel}</span>
                            )}
                        </div>
                    </div>

                    {/* Header actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const link = `${window.location.origin}/#/signup/teacher?schoolId=${user?.schoolId || ''}`;
                                navigator.clipboard.writeText(link);
                                import('react-hot-toast').then(m => m.default.success('Teacher invite link copied!'));
                            }}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-all"
                        >
                            <Users size={14} /> Invite Teachers
                        </button>
                        <button
                            onClick={() => {
                                const link = `${window.location.origin}/#/signup/student?schoolId=${user?.schoolId || ''}`;
                                navigator.clipboard.writeText(link);
                                import('react-hot-toast').then(m => m.default.success('Student invite link copied!'));
                            }}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
                        >
                            <GraduationCap size={14} /> Invite Students
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
