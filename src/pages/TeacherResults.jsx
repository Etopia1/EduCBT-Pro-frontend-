import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import TeacherLayout from '../components/TeacherLayout';
import { 
    FileText, Users, Download, Search, Filter, 
    TrendingUp, Award, BarChart3, AlertCircle, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherResults = () => {
    const navigate = useNavigate();
    const { token, user } = useSelector((state) => state.auth);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchExams();
    }, [token]);

    useEffect(() => {
        if (selectedExam) {
            fetchResults(selectedExam._id);
        }
    }, [selectedExam]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:2000/exam/teacher/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExams(res.data);
            if (res.data.length > 0) {
                setSelectedExam(res.data[0]);
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async (examId) => {
        try {
            const res = await axios.get(`http://localhost:2000/exam/${examId}/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter only completed sessions
            const completedSessions = res.data.filter(
                session => (session.status === 'completed' || session.status === 'terminated') && session.hasStarted
            );
            setResults(completedSessions);
        } catch (error) {
            console.error('Error fetching results:', error);
            toast.error('Failed to load results');
        }
    };

    const exportToCSV = () => {
        if (results.length === 0) {
            toast.error('No results to export');
            return;
        }

        const headers = ['Student Name', 'Registration Number', 'Class', 'Score', 'Total Marks', 'Percentage', 'Status', 'Violations', 'Submission Time'];
        const csvData = results.map(result => [
            result.student.name,
            result.student.registrationNumber || 'N/A',
            result.student.classLevel,
            result.score?.toFixed(2) || '0',
            selectedExam?.totalMarks || '100',
            result.percentage?.toFixed(2) || '0',
            result.status,
            result.violationCount || '0',
            result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'N/A'
        ]);

        const csv = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedExam?.title || 'exam'}_results_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Results exported successfully!');
    };

    const filteredResults = results.filter(result => {
        const matchesSearch = result.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' || result.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const calculateStats = () => {
        if (results.length === 0) return { avgScore: 0, highestScore: 0, lowestScore: 0, passRate: 0 };

        const scores = results.map(r => r.score || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);
        const passRate = (results.filter(r => (r.percentage || 0) >= 50).length / results.length) * 100;

        return { avgScore, highestScore, lowestScore, passRate };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <TeacherLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                     <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse rounded-full"></div>
                     </div>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative">
                    <div className="absolute -top-24 -left-20 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-4">
                            <BarChart3 size={12} className="text-indigo-400" />
                            <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Performance Intelligence</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tight uppercase">
                            Analysis <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Nexus</span>
                        </h1>
                        
                        <div className="mt-6 space-y-2 max-w-lg">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Active Data Stream</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-indigo-400 transition-colors" size={20} />
                                <select
                                    value={selectedExam?._id || ''}
                                    onChange={(e) => {
                                        const exam = exams.find(ex => ex._id === e.target.value);
                                        setSelectedExam(exam);
                                    }}
                                    className="w-full pl-12 pr-10 py-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 text-white font-bold appearance-none cursor-pointer shadow-inner"
                                >
                                    {exams.map(exam => (
                                        <option key={exam._id} value={exam._id} className="bg-slate-900">
                                            {exam.title} ({exam.classLevel})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={exportToCSV}
                        disabled={results.length === 0}
                        className="group flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
                    >
                        <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                        Export Dataset
                    </button>
                </div>

                {/* Statistics Modules */}
                {selectedExam && results.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Average Score', value: stats.avgScore.toFixed(1), total: selectedExam.totalMarks, perc: ((stats.avgScore / selectedExam.totalMarks) * 100).toFixed(1), icon: TrendingUp, color: 'indigo' },
                            { label: 'Prime Score', value: stats.highestScore.toFixed(1), total: selectedExam.totalMarks, perc: ((stats.highestScore / selectedExam.totalMarks) * 100).toFixed(1), icon: Award, color: 'amber' },
                            { label: 'Floor Score', value: stats.lowestScore.toFixed(1), total: selectedExam.totalMarks, perc: ((stats.lowestScore / selectedExam.totalMarks) * 100).toFixed(1), icon: AlertCircle, color: 'rose' },
                            { label: 'Success Rate', value: `${stats.passRate.toFixed(1)}%`, sub: `${results.filter(r => (r.percentage || 0) >= 50).length} of ${results.length} Passed`, icon: Users, color: 'emerald' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 group hover:border-indigo-500/20 transition-all overflow-hidden relative">
                                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${stat.color}-500/5 blur-3xl rounded-full`} />
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                    <stat.icon size={20} className={`text-${stat.color}-500/50`} />
                                </div>
                                <div className="text-3xl font-black text-white italic tracking-tighter">
                                    {stat.value}
                                    {stat.total && <span className="text-sm font-bold text-slate-600 ml-1">/{stat.total}</span>}
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest mt-2 ${stat.perc ? (parseFloat(stat.perc) >= 50 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-500'}`}>
                                    {stat.perc ? `${stat.perc}% Efficiency` : stat.sub}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters & Search Nexus */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Identify student by name or reference ID..."
                            className="w-full pl-14 pr-6 py-4.5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 text-slate-200 font-bold transition-all placeholder:text-slate-700 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl w-full md:w-auto h-auto">
                        <div className="flex items-center gap-3 px-4 py-2">
                             <Filter size={16} className="text-slate-600" />
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filter:</span>
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-slate-300 font-black text-[10px] uppercase tracking-widest outline-none pr-4 cursor-pointer"
                        >
                            <option value="all" className="bg-slate-900">All Nodes</option>
                            <option value="completed" className="bg-slate-900">Finalized</option>
                            <option value="terminated" className="bg-slate-900">Terminated</option>
                        </select>
                    </div>
                </div>

                {/* Results Spreadsheet View */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {filteredResults.length === 0 ? (
                        <div className="py-32 text-center group">
                            <div className="w-20 h-20 bg-slate-950/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                                <FileText size={40} className="text-slate-700 group-hover:text-indigo-500/50 transition-colors" />
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">No Records Detected</h3>
                            <p className="text-slate-600 max-w-xs mx-auto text-sm font-medium italic">
                                {results.length === 0
                                    ? 'Awaiting first student submission for this assessment sequence.'
                                    : 'Your query parameters yielded no matching results in this dataset.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/2 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                                    <tr>
                                        <th className="px-8 py-6">Identity</th>
                                        <th className="px-8 py-6">Reference</th>
                                        <th className="px-8 py-6">Class Node</th>
                                        <th className="px-8 py-6 text-center">Efficiency Score</th>
                                        <th className="px-8 py-6 text-center">Percentile</th>
                                        <th className="px-8 py-6 text-center">Anomaly Count</th>
                                        <th className="px-8 py-6 text-center">Vitals</th>
                                        <th className="px-8 py-6 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredResults.map((result) => (
                                        <tr key={result._id} className="hover:bg-white/2 transition-all group">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center font-black text-sm italic shadow-inner">
                                                        {result.student.name.charAt(0)}
                                                    </div>
                                                    <div className="font-black text-white uppercase italic text-sm tracking-tight group-hover:text-indigo-400 transition-colors">
                                                        {result.student.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                {result.student.registrationNumber || 'N/A'}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-indigo-400/80 uppercase tracking-widest italic">
                                                {result.student.classLevel}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-center">
                                                <div className="text-lg font-black text-white italic tracking-tighter">
                                                    {result.score?.toFixed(1) || '0'}
                                                    <span className="text-[10px] font-bold text-slate-700 ml-1">/{selectedExam?.totalMarks || 100}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-center">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${(result.percentage || 0) >= 75 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    (result.percentage || 0) >= 50 ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                                        'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    }`}>
                                                    {result.percentage?.toFixed(1) || '0'}%
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-center">
                                                <div className={`inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-black ${result.violationCount === 0 ? 'text-slate-600' :
                                                    result.violationCount < 3 ? 'text-amber-500 bg-amber-500/10' :
                                                        'text-rose-500 bg-rose-500/10 animate-pulse'
                                                    }`}>
                                                    {result.violationCount || 0}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-center">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${result.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    }`}>
                                                    {result.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right text-[10px] font-bold text-slate-600 uppercase tracking-tighter italic">
                                                {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'N/A'}
                                                <br />
                                                {result.submittedAt ? new Date(result.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherResults;

