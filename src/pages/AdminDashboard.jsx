import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AdminLayout from '../components/AdminLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, GraduationCap, CheckCircle, Clock, AlertTriangle,
    UserCheck, TrendingUp, BookOpen, Zap, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

// ── Glassy stat card ────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, gradient, glow }) => (
    <div className={`relative overflow-hidden rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm p-6 flex flex-col gap-3 group hover:border-white/15 transition-all duration-300`}>
        {/* Glow blob */}
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity duration-500 ${glow}`} />
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <ArrowUpRight size={12} />
            <span>This term</span>
        </div>
    </div>
);

// ── Custom dark tooltip for recharts ────────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
            <p className="text-slate-400 text-xs mb-2 font-semibold">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="text-sm font-bold">
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalTeachers: 0, totalStudents: 0,
        pendingApprovals: 0, activeExams: 0,
        totalExams: 0, currentTermEndDate: ''
    });
    const [userGrowth, setUserGrowth] = useState([]);
    const [integrityData, setIntegrityData] = useState([
        { name: 'Normal', value: 85 },
        { name: 'Flagged', value: 10 },
        { name: 'Locked', value: 5 }
    ]);
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [statsRes, growthRes] = await Promise.all([
                axios.get('http://localhost:2000/school/dashboard/stats', config),
                axios.get('http://localhost:2000/school/analytics/user-growth', config)
            ]);
            setStats(statsRes.data);
            setUserGrowth(growthRes.data);
        } catch (error) {
            console.error('Dashboard error:', error);
        }
    };

    const kpiCards = [
        { title: 'Total Teachers', value: stats.totalTeachers, icon: Users, gradient: 'from-indigo-500 to-purple-600', glow: 'bg-indigo-500' },
        { title: 'Total Students', value: stats.totalStudents, icon: GraduationCap, gradient: 'from-emerald-500 to-teal-600', glow: 'bg-emerald-500' },
        { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, gradient: 'from-amber-500 to-orange-600', glow: 'bg-amber-500' },
        { title: 'Active Exams', value: stats.activeExams, icon: Zap, gradient: 'from-blue-500 to-cyan-600', glow: 'bg-blue-500' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8">

                {/* ── Welcome banner ─────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 md:p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 bg-indigo-500 -translate-y-1/2 translate-x-1/2" />
                    {/* Dot grid */}
                    <div className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
                            backgroundSize: '22px 22px'
                        }}
                    />
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-4">
                            <Zap size={12} className="text-indigo-400" />
                            <span className="text-indigo-300 text-xs font-semibold">School Dashboard</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                            Good morning, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{user?.schoolName || 'Admin'}</span> 👋
                        </h1>
                        <p className="text-slate-400 text-sm">Here's an overview of your school's activity today.</p>
                    </div>
                </div>

                {/* ── KPI Cards ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {kpiCards.map((card) => (
                        <StatCard key={card.title} {...card} />
                    ))}
                </div>

                {/* ── Charts ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* User Growth Bar Chart */}
                    <div className="rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-bold text-white">User Growth</h3>
                                <p className="text-slate-400 text-xs mt-0.5">Students & teachers over time</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1.5 text-slate-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Students
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Teachers
                                </span>
                            </div>
                        </div>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userGrowth} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                    <Bar dataKey="students" name="Students" fill="#10B981" radius={[5, 5, 0, 0]} />
                                    <Bar dataKey="teachers" name="Teachers" fill="#6366F1" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Exam Integrity Donut */}
                    <div className="rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm p-6">
                        <div className="mb-6">
                            <h3 className="text-base font-bold text-white">Exam Integrity</h3>
                            <p className="text-slate-400 text-xs mt-0.5">Session behaviour overview</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="h-48 flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={integrityData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={52}
                                            outerRadius={72}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {integrityData.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<DarkTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-3">
                                {integrityData.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                                        <div>
                                            <p className="text-slate-300 text-sm font-semibold">{entry.name}</p>
                                            <p className="text-slate-500 text-xs">{entry.value}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Alerts & Term ──────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* System Alerts */}
                    <div className="rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm p-6">
                        <h3 className="text-base font-bold text-white mb-5">System Alerts</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h4 className="font-bold text-red-300 text-sm">Exam Integrity Warning</h4>
                                    <p className="text-red-400/70 text-xs mt-0.5">Multiple tab-switch incidents detected in Physics 101.</p>
                                </div>
                            </div>
                            {stats.pendingApprovals > 0 && (
                                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <Clock className="text-amber-400 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <h4 className="font-bold text-amber-300 text-sm">Pending Approvals</h4>
                                        <p className="text-amber-400/70 text-xs mt-0.5">{stats.pendingApprovals} student(s) waiting for verification.</p>
                                    </div>
                                </div>
                            )}
                            {stats.pendingApprovals === 0 && (
                                <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <h4 className="font-bold text-emerald-300 text-sm">All Clear</h4>
                                        <p className="text-emerald-400/70 text-xs mt-0.5">No pending approvals. Everything is up to date.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Term Settings */}
                    <div className="rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm p-6">
                        <h3 className="text-base font-bold text-white mb-5">Term Settings</h3>
                        <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
                            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl bg-indigo-500 opacity-10" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <Clock size={18} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200 text-sm">Current Term End Date</h4>
                                    <p className="text-slate-400 text-xs">Set the date when this term closes.</p>
                                </div>
                            </div>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                                value={stats.currentTermEndDate ? new Date(stats.currentTermEndDate).toISOString().split('T')[0] : ''}
                                onChange={async (e) => {
                                    try {
                                        const newDate = e.target.value;
                                        await axios.post('http://localhost:2000/school/term/update',
                                            { termEndDate: newDate },
                                            { headers: { Authorization: `Bearer ${token}` } }
                                        );
                                        toast.success('Term date updated');
                                        setStats(prev => ({ ...prev, currentTermEndDate: newDate }));
                                    } catch {
                                        toast.error('Failed to update term');
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
