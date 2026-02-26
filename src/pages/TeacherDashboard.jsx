import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TeacherLayout from '../components/TeacherLayout';
import { LayoutDashboard, BookOpen, UserCheck, AlertCircle, CheckCircle, ChevronRight, Plus, ArrowUpRight, TrendingUp, Users, Clock, Zap, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, description }) => (
    <div className="premium-card p-5 md:p-8 group relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 blur-[60px] rounded-full group-hover:bg-[#c5a059]/10 transition-colors" />
        <div className="relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#1a120b] flex items-center justify-center mb-4 md:mb-6 border border-[#c5a059]/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Icon size={18} className="text-[#c5a059]" />
            </div>
            <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] mb-1 md:mb-2">{label}</p>
            <h3 className="text-3xl md:text-4xl font-black text-[#1a150e] tracking-tighter italic uppercase mb-1 md:mb-2 group-hover:gold-text-gradient transition-all">{value}</h3>
            <p className="text-slate-400 text-[8px] md:text-[9px] font-bold uppercase tracking-widest leading-none">{description}</p>
        </div>
    </div>
);

const GoldTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1a120b] border border-[#c5a059]/20 rounded-2xl px-6 py-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2 italic">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-white text-lg font-black italic">
                    {p.value}<span className="text-[#c5a059] text-xs ml-1">% Performance</span>
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

    const performanceData = [
        { name: 'MON', score: 65 },
        { name: 'TUE', score: 82 },
        { name: 'WED', score: 78 },
        { name: 'THU', score: 90 },
        { name: 'FRI', score: 85 },
    ];

    useEffect(() => {
        if (token) {
            fetchPendingStudents();
            fetchRecentTests();
        }
    }, [token]);

    const fetchPendingStudents = async () => {
        try {
            const res = await axios.get('http://localhost:2000/school/teacher/pending-students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingStudents(res.data);
        } catch (error) {
            console.error("Fetch students error:", error);
        }
    };

    const fetchRecentTests = async () => {
        try {
            const res = await axios.get('http://localhost:2000/exam/teacher/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentTests(res.data);
        } catch (error) {
            console.error("Fetch tests error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (studentId) => {
        setApprovingId(studentId);
        try {
            await axios.post(`http://localhost:2000/school/teacher/approve-student/${studentId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Identity Verified Successful");
            setPendingStudents(prev => prev.filter(s => s._id !== studentId));
        } catch (error) {
            toast.error("Process Failed");
        } finally {
            setApprovingId(null);
        }
    };

    return (
        <TeacherLayout>
            <div className="max-w-7xl mx-auto space-y-12 pb-20 font-outfit">
                {/* Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 py-2 md:py-4">
                    <div className="space-y-3 animate-fade-in-up">
                        <div className="inline-flex items-center gap-3 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
                            <Activity size={14} className="text-[#c5a059]" />
                            <span className="text-[#a18146] text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em]">Session Link: High Stability</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#1a150e] leading-none tracking-tighter uppercase italic">
                            Faculty <span className="gold-text-gradient">Hub</span>
                        </h1>
                        <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">System Operator: <span className="text-[#1a150e] font-black">{user?.fullName || 'Educator'}</span>. Managing digital infrastructure.</p>
                    </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard label="Assessment Vault" value={recentTests.length} icon={BookOpen} description="Live Script Distribution" />
                    <StatCard label="Success Index" value="94.2%" icon={TrendingUp} description="Institutional Growth" />
                    <StatCard label="Registry Pend" value={pendingStudents.length} icon={Clock} description="Awaiting Clearance" />
                    <StatCard label="Operational Rank" value="#42" icon={Activity} description="Top 1% Performers" />
                </div>

                {/* Clearance Notifications */}
                {pendingStudents.length > 0 && (
                    <div className="bg-[#1a120b] border border-[#c5a059]/20 rounded-2xl md:rounded-[3rem] p-6 md:p-12 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12">
                            <div className="flex items-center gap-4 md:gap-5">
                                <div className="w-12 md:w-14 h-12 md:h-14 rounded-xl md:rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shadow-inner">
                                    <Clock size={24} md:size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg md:text-xl font-black text-white italic tracking-tighter uppercase">Registry Verification Queue</h3>
                                    <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                        Clearance Authorization Required
                                    </p>
                                </div>
                            </div>
                            <button className="text-[9px] md:text-[10px] font-black text-[#c5a059] uppercase tracking-[0.25em] bg-[#c5a059]/5 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl border border-[#c5a059]/10 hover:bg-[#c5a059]/10 transition-all">Clear All Pending</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {pendingStudents.map((student) => (
                                <div key={student._id} className="bg-white/5 border border-white/5 p-5 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-between group hover:bg-white/10 hover:border-[#c5a059]/30 transition-all">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-900 flex items-center justify-center text-[#c5a059] font-black text-xs md:text-sm uppercase italic border border-white/5 group-hover:rotate-12 transition-all">
                                            {student.fullName.charAt(0)}
                                        </div>
                                        <div className="space-y-0.5 md:space-y-1">
                                            <p className="text-xs md:text-sm font-black text-white italic tracking-tight">{student.fullName}</p>
                                            <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest">{student.classLevel}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleApprove(student._id)}
                                        disabled={approvingId === student._id}
                                        className="h-9 md:h-10 px-4 md:px-5 bg-[#c5a059] hover:bg-[#e2c08d] text-[#1a120b] text-[9px] md:text-[10px] font-black rounded-lg md:rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
                                    >
                                        {approvingId === student._id ? '...' : <CheckCircle size={12} md:size={14} />}
                                        {approvingId === student._id ? '' : 'Verify'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Primary Intelligence Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-10">
                    {/* Performance Metrics */}
                    <div className="premium-card p-6 md:p-10 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="flex justify-between items-center mb-8 md:mb-12">
                             <div>
                                <h3 className="text-lg md:text-xl font-black text-[#1a150e] tracking-tighter uppercase italic">Visual Performance</h3>
                                <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1">Institutional score trajectory</p>
                             </div>
                             <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-[#c5a059] border border-slate-100">
                                <TrendingUp size={18} />
                             </div>
                        </div>
                        <div className="h-64 md:h-80 w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                                    <Tooltip content={<GoldTooltip />} cursor={{ fill: '#f8fafc', radius: 12 }} />
                                    <Bar dataKey="score" fill="url(#colorGold)" radius={[6, 6, 0, 0]} />
                                    <defs>
                                        <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#c5a059" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#c5a059" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Assessment Script Vault */}
                    <div className="premium-card p-6 md:p-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-[#1a150e] tracking-tighter uppercase italic">Script Repository</h3>
                                <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1">Recently engineered assessments</p>
                            </div>
                            <button onClick={() => navigate('/teacher/tests')} className="text-[9px] md:text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em] bg-[#c5a059]/5 px-4 md:px-5 py-2 rounded-lg border border-[#c5a059]/10 hover:bg-[#c5a059]/10 transition-all w-fit">View All</button>
                        </div>

                        <div className="space-y-4">
                            {recentTests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 md:py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl md:rounded-[2rem]">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm">
                                        <BookOpen size={20} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">No scripts distributed.</p>
                                </div>
                            ) : (
                                recentTests.map(test => (
                                    <div key={test._id} className="flex items-center justify-between p-4 md:p-6 bg-slate-50/50 hover:bg-white border border-slate-100/50 hover:border-[#c5a059]/30 rounded-2xl md:rounded-[2rem] transition-all group cursor-pointer" onClick={() => navigate('/teacher/tests')}>
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="w-10 md:w-12 h-10 md:h-12 bg-[#1a120b] text-[#c5a059] rounded-xl md:rounded-2xl flex items-center justify-center font-black text-[10px] md:text-xs border border-[#c5a059]/10 shadow-lg group-hover:rotate-12 transition-all italic shrink-0">
                                                {test.subject.charAt(0)}
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <h4 className="text-sm md:text-[15px] font-black text-[#1a150e] leading-none uppercase italic group-hover:text-[#c5a059] transition-colors truncate">{test.title}</h4>
                                                <div className="flex items-center gap-2 md:gap-4">
                                                    <span className="text-[8px] md:text-[9px] text-[#c5a059] font-black uppercase tracking-widest">{test.subject}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest">{test.questions?.length} Items</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#c5a059] group-hover:border-[#c5a059]/20 transition-all shadow-sm shrink-0">
                                            <ArrowUpRight size={16} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Operations Footer */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                    <div className="bg-[#1a120b] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden group border border-[#c5a059]/20 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                        <div className="absolute top-[-20%] right-[-10%] w-[15rem] md:w-[25rem] h-[15rem] md:h-[25rem] bg-[#c5a059] blur-[100px] opacity-[0.05] rounded-full group-hover:opacity-[0.1] transition-all duration-700"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="space-y-3 md:space-y-2 mb-8 md:mb-10">
                                <h4 className="text-2xl md:text-3xl font-black text-[#c5a059] uppercase italic tracking-tighter">Presence Control</h4>
                                <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed max-w-xs">Initialize institutional duty clock and log faculty presence cycles.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="flex-1 h-12 md:h-14 bg-[#c5a059] hover:bg-[#e2c08d] text-[#1a120b] text-[9px] md:text-[10px] font-black rounded-xl md:rounded-[1.25rem] transition-all shadow-xl shadow-[#c5a059]/20 active:scale-95 uppercase tracking-[0.2em]">Initialize Duty</button>
                                <button className="flex-1 h-12 md:h-14 bg-white/5 hover:bg-white/10 text-white text-[9px] md:text-[10px] font-black rounded-xl md:rounded-[1.25rem] border border-white/10 transition-all active:scale-95 uppercase tracking-[0.2em]">Cycle History</button>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-8 md:p-12 relative overflow-hidden group animate-fade-in-up shadow-lg" style={{ animationDelay: '0.8s' }}>
                        <div className="absolute top-[-20%] right-[-10%] w-[15rem] md:w-[25rem] h-[15rem] md:h-[25rem] bg-[#c5a059]/5 blur-[80px] rounded-full group-hover:bg-[#c5a059]/10 transition-all duration-700"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="space-y-3 md:space-y-2 mb-8 md:mb-10">
                                <h4 className="text-2xl md:text-3xl font-black text-[#1a150e] uppercase italic tracking-tighter">Script Engineering</h4>
                                <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed max-w-xs">Protocol for deploying high-integrity assessment scripts to students.</p>
                            </div>
                            <button onClick={() => navigate('/teacher/tests/create')} className="btn-primary w-full h-12 md:h-14 rounded-xl md:rounded-[1.25rem] shadow-xl shadow-black/5 !px-4 md:!px-10">Launch Session Engine</button>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout >
    );
};

export default TeacherDashboard;
