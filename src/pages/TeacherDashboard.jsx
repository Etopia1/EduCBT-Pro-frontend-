import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import TeacherLayout from '../components/TeacherLayout';
import { Users, FileText, CheckCircle, Clock, UserCheck, AlertCircle, Plus, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

// ── Premium Dark Components ──────────────────────────────────────────
const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const StatCard = ({ title, value, icon: Icon, gradient, glow }) => (
    <div className={`relative overflow-hidden rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm p-6 flex flex-col gap-3 group hover:border-white/15 transition-all duration-300`}>
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity duration-500 ${glow}`} />
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
        <div className="flex items-center gap-1 text-indigo-400 text-xs font-semibold">
            <Plus size={12} />
            <span>This term</span>
        </div>
    </div>
);

const DarkTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 shadow-xl font-sans">
            <p className="text-slate-400 text-xs mb-2 font-semibold">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="text-sm font-bold">
                    {p.name}: {p.value}%
                </p>
            ))}
        </div>
    );
};

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [pendingStudents, setPendingStudents] = useState([]);
    const [recentTests, setRecentTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [approvingId, setApprovingId] = useState(null);
    const { token, user } = useSelector((state) => state.auth);

    const [stats, setStats] = useState({
        totalStudents: 0,
        pendingApprovals: 0,
        activeTests: 0,
        avgScore: 'N/A'
    });

    const performanceData = [
        { name: 'Mon', score: 65 },
        { name: 'Tue', score: 72 },
        { name: 'Wed', score: 68 },
        { name: 'Thu', score: 85 },
        { name: 'Fri', score: 78 },
    ];

    useEffect(() => {
        if (token) fetchDashboardData();
    }, [token]);

    const [teacherProfile, setTeacherProfile] = useState(null);

    const fetchDashboardData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            setIsLoading(true);
            const [statsRes, pendingRes, examsRes, profileRes] = await Promise.all([
                axios.get('http://localhost:2000/school/teacher/stats', config),
                axios.get('http://localhost:2000/school/teacher/pending-students', config),
                axios.get('http://localhost:2000/exam/teacher/all', config),
                axios.get('http://localhost:2000/school/teacher/profile', config)
            ]);

            setStats({
                ...statsRes.data,
                activeTests: statsRes.data.activeExams
            });
            setPendingStudents(pendingRes.data);
            setRecentTests(examsRes.data.slice(0, 3));
            setTeacherProfile(profileRes.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveStudent = async (studentId) => {
        setApprovingId(studentId);
        try {
            await axios.post('http://localhost:2000/school/teacher/approve-student',
                { studentId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Student approved!');
            setPendingStudents(prev => prev.filter(s => s._id !== studentId));
            setStats(prev => ({
                ...prev,
                pendingApprovals: Math.max(0, prev.pendingApprovals - 1)
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        } finally {
            setApprovingId(null);
        }
    };

    const statCards = [
        { title: 'Total Students', value: stats.totalStudents, icon: Users, gradient: 'from-indigo-500 to-purple-600', glow: 'bg-indigo-500' },
        { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, gradient: 'from-amber-500 to-orange-600', glow: 'bg-amber-500' },
        { title: 'Active Tests', value: stats.activeTests, icon: FileText, gradient: 'from-emerald-500 to-teal-600', glow: 'bg-emerald-500' },
        { title: 'Avg. Score', value: stats.avgScore, icon: CheckCircle, gradient: 'from-blue-500 to-cyan-600', glow: 'bg-blue-500' },
    ];

    return (
        <TeacherLayout>
            <div className="space-y-8 pb-10">
                {/* ── Welcome Banner ─────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 md:p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 bg-indigo-500 -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
                            backgroundSize: '22px 22px'
                        }}
                    />
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
                                <Plus size={12} className="text-indigo-400" />
                                <span className="text-indigo-300 text-xs font-semibold">Teacher Dashboard</span>
                            </div>
                            {teacherProfile?.subscription?.canMonitor && (
                                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 animate-pulse">
                                    <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest leading-none">✨ Premium Pro</span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                            Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{user?.fullName || 'Teacher'}</span> 🎓
                        </h1>
                        <p className="text-slate-400 text-sm italic">Manage your classes and assessments with precision.</p>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((card) => (
                        <StatCard key={card.title} {...card} />
                    ))}
                </div>

                {/* Approvals Section */}
                {pendingStudents.length > 0 && (
                    <div className="rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm p-6 overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 opacity-5 blur-3xl"></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                             <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <UserCheck className="text-amber-400" size={20} />
                             </div>
                             <div>
                                <h3 className="text-base font-bold text-white">Pending Approvals</h3>
                                <p className="text-slate-400 text-xs">Students awaiting your verification</p>
                             </div>
                        </div>

                        <div className="space-y-3">
                            {pendingStudents.map((student) => (
                                <div key={student._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-lg border border-white/10 group-hover:border-amber-500/30 transition-colors">
                                            {student.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-200">{student.fullName}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {student.info?.registrationNumber || 'No ID'} • <span className="text-amber-400/80">{student.info?.classLevel}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleApproveStudent(student._id)}
                                        disabled={approvingId === student._id}
                                        className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {approvingId === student._id ? <span className="animate-spin text-lg">◌</span> : <CheckCircle size={14} />}
                                        {approvingId === student._id ? 'Working...' : 'Approve'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Charts and Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">

                    {/* Performance Chart */}
                    <div className="rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                             <div>
                                <h3 className="text-base font-bold text-white">Class Performance</h3>
                                <p className="text-slate-400 text-xs">Average scores for the week</p>
                             </div>
                             <div className="p-2 rounded-lg bg-indigo-500/10">
                                <Plus size={16} className="text-indigo-400" />
                             </div>
                        </div>
                        <div className="h-64 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                    <Bar dataKey="score" fill="url(#colorScore)" radius={[6, 6, 0, 0]} />
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Tests */}
                    <div className="rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-bold text-white">My Tests</h3>
                            <button onClick={() => navigate('/teacher/tests')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View All</button>
                        </div>

                        <div className="space-y-4">
                            {recentTests.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 text-sm italic">No tests created yet</div>
                            ) : (
                                recentTests.map(test => (
                                    <div key={test._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer" onClick={() => navigate('/teacher/tests')}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold border border-indigo-500/20">
                                                {test.subject.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-200 truncate max-w-[150px]">{test.title}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{test.subject}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span className="text-[10px] text-indigo-400 font-black">{test.questions?.length} Qs</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${test.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-white/5'}`}>
                                            {test.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-lg font-black text-emerald-400 mb-2">Staff Attendance</h4>
                        <p className="text-emerald-100/50 text-xs mb-6">Log your daily check-in and check-out to record your hours.</p>
                        <div className="flex gap-3">
                            <button className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">Check In</button>
                            <button className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-emerald-400 text-sm font-bold rounded-2xl border border-white/5 transition-all active:scale-95">Check Out</button>
                        </div>
                    </div>

                    <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-lg font-black text-indigo-400 mb-2">Build New Test</h4>
                        <p className="text-indigo-100/50 text-xs mb-6">Launch the high-performance test engine to create assessments.</p>
                        <button onClick={() => navigate('/teacher/tests/create')} className="w-full h-11 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">Launch Engine</button>
                    </div>
                </div>
            </div>
        </TeacherLayout >
    );
};

export default TeacherDashboard;

