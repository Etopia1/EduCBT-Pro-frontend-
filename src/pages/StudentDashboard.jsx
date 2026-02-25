import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, AlertCircle, Play, FileText, User, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

import StudentLayout from '../components/StudentLayout';

// ── Shared Stat Card Component ─────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-white/8 p-6 rounded-2xl flex items-center gap-4 group hover:border-white/15 transition-all">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-lg ring-1 ring-white/10`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black text-white">{value}</p>
        </div>
    </div>
);

const StudentDashboard = () => {
    const { token, user } = useSelector((state) => state.auth);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [view, setView] = useState('exams'); // 'exams' or 'results'
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (token) {
            fetchExams();
            fetchResults();
        }
    }, [token]);

    const fetchExams = async () => {
        try {
            const res = await axios.get('http://localhost:2000/exam/student', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExams(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching student exams:", error);
            toast.error("Failed to load tests");
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        try {
            const res = await axios.get('http://localhost:2000/exam/results', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
        } catch (error) {
            console.error("Error fetching results:", error);
        }
    };

    return (
        <StudentLayout>
            <div className="space-y-8 pb-10">
                {/* ── KPI Container ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Active Tests" 
                        value={exams.length} 
                        icon={BookOpen} 
                        color="from-indigo-500 to-purple-600" 
                    />
                    <StatCard 
                        title="Completed" 
                        value={results.length} 
                        icon={CheckCircle} 
                        color="from-emerald-500 to-teal-600" 
                    />
                    <StatCard 
                        title="Notifications" 
                        value="3" 
                        icon={Bell} 
                        color="from-amber-500 to-orange-600" 
                    />
                </div>

                {/* ── View Toggle ─────────────────────────────────────────── */}
                <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/5 backdrop-blur-sm">
                    <button
                        onClick={() => setView('exams')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'exams' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Available Exams
                    </button>
                    <button
                        onClick={() => setView('results')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'results' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        My Results
                    </button>
                </div>

                {view === 'exams' ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                Available Assessments
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="bg-white/5 h-48 rounded-2xl border border-white/5 animate-pulse" />)
                            ) : exams.length === 0 ? (
                                <div className="col-span-full py-20 text-center italic text-slate-500">No exams available for your class at the moment.</div>
                            ) : (
                                exams.map(exam => (
                                    <div key={exam._id} className={`group relative bg-slate-800/40 backdrop-blur-sm border rounded-2xl p-6 transition-all hover:border-white/20 ${exam.isCompleted ? 'border-emerald-500/20 shadow-emerald-500/5' : 'border-white/8 shadow-2xl shadow-black/20'}`}>
                                        
                                        {/* Glow effect */}
                                        <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full ${exam.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} />

                                        {exam.isCompleted && (
                                            <div className="absolute top-4 right-4 bg-emerald-500/90 text-white rounded-lg p-1 shadow-lg backdrop-blur-sm">
                                                <CheckCircle size={14} />
                                            </div>
                                        )}

                                        <div className="mb-4 relative z-10">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border ${exam.isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                                {exam.subject}
                                            </span>
                                            <h3 className="text-lg font-black text-white mt-3 leading-tight group-hover:text-indigo-400 transition-colors uppercase italic truncate">
                                                {exam.title}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <div className="p-1.5 rounded-lg bg-white/5">
                                                    <Clock size={12} />
                                                </div>
                                                <span className="text-xs font-bold">{exam.durationMinutes} Mins</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <div className="p-1.5 rounded-lg bg-white/5">
                                                    <FileText size={12} />
                                                </div>
                                                <span className="text-xs font-bold">{exam.questions?.length || 0} Qs</span>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            {exam.isCompleted ? (
                                                <div className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-xl border border-emerald-500/20 cursor-not-allowed">
                                                    <CheckCircle size={14} />
                                                    Completed
                                                </div>
                                            ) : exam.status === 'active' ? (
                                                <button
                                                    onClick={() => navigate(`/exam/${exam._id}`)}
                                                    className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                                                >
                                                    Start Exam
                                                    <Play size={14} fill="currentColor" />
                                                </button>
                                            ) : (
                                                <div className="w-full h-11 flex items-center justify-center gap-2 bg-white/5 text-slate-500 text-xs font-black uppercase tracking-widest rounded-xl border border-white/5 cursor-not-allowed">
                                                    <AlertCircle size={14} />
                                                    Not Started
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/8 bg-slate-800/40 backdrop-blur-sm overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                    <tr>
                                        <th className="px-6 py-5">Subject</th>
                                        <th className="px-6 py-5">Exam Title</th>
                                        <th className="px-6 py-5 text-center">Score</th>
                                        <th className="px-6 py-5">Date</th>
                                        <th className="px-6 py-5 text-right">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {results.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic font-bold">No records found.</td>
                                        </tr>
                                    ) : (
                                        results.map(res => (
                                            <tr key={res._id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">{res.subject}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-bold text-slate-200 truncate max-w-[200px]">{res.examTitle}</p>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="inline-flex items-baseline gap-1 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                                        <span className="text-sm font-black text-white">{res.score}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold">/ {res.totalMarks}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-xs text-slate-400">{new Date(res.submittedAt).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${res.grade === 'Pass' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                        {res.grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;

