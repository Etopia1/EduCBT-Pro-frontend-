import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
    Plus, Search, BookOpen, Clock, MoreVertical, Edit, Trash2, 
    Eye, LayoutGrid, List as ListIcon, FileDown, Monitor, 
    BarChart2, Play, AlertCircle, ShieldCheck, FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TeacherTests = () => {
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        if (token) fetchExams();
    }, [token]);

    const fetchExams = async () => {
        try {
            const res = await axios.get('https://educbt-pro-backend.onrender.com/exam/teacher/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExams(res.data);
        } catch (error) {
            toast.error("Failed to load exams");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'active' ? 'ended' : 'active';
        try {
            await axios.patch(`https://educbt-pro-backend.onrender.com/exam/${id}/status`,
                { status: nextStatus, isActive: nextStatus === 'active' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Exam ${nextStatus === 'active' ? 'Started' : 'Ended'}`);
            fetchExams();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this test? This action cannot be undone.")) return;

        try {
            await axios.delete(`https://educbt-pro-backend.onrender.com/exam/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Exam deleted successfully");
            fetchExams();
        } catch (error) {
            toast.error("Failed to delete exam");
        }
    };

    const handleExportPDF = (exam) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // Header - School & Test Details
        doc.setFontSize(20);
        doc.setTextColor(31, 41, 55);
        doc.text(exam.title.toUpperCase(), pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229);
        doc.text(exam.subject.toUpperCase(), pageWidth / 2, 28, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Duration: ${exam.durationMinutes} Minutes | Total Marks: ${exam.totalMarks || 100}`, pageWidth / 2, 35, { align: 'center' });

        doc.setDrawColor(200);
        doc.line(20, 40, pageWidth - 20, 40);

        // Student Info Placeholder
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);
        doc.text("NAME: ____________________________________", 20, 50);
        doc.text("REG NO: __________________", 130, 50);
        doc.text("DATE: ____________________", 20, 58);

        doc.line(20, 65, pageWidth - 20, 65);

        // Questions Section
        let yPos = 75;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("QUESTIONS", 20, yPos);
        yPos += 10;
        doc.setFont("helvetica", "normal");

        exam.questions.forEach((q, qIdx) => {
            // Check for page break
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.text(`${qIdx + 1}.`, 20, yPos);

            // Handle multi-line question text
            const questionText = doc.splitTextToSize(q.text, pageWidth - 45);
            doc.text(questionText, 30, yPos);
            yPos += (questionText.length * 6) + 4;

            // Options
            q.options.forEach((opt, oIdx) => {
                if (yPos > 275) {
                    doc.addPage();
                    yPos = 20;
                }
                const optPrefix = String.fromCharCode(65 + oIdx);
                doc.setFont("helvetica", "bold");
                doc.text(`(${optPrefix})`, 35, yPos);
                doc.setFont("helvetica", "normal");

                const optText = doc.splitTextToSize(opt, pageWidth - 60);
                doc.text(optText, 45, yPos);
                yPos += (optText.length * 6) + 2;
            });

            yPos += 6; // Space between questions
        });

        // Footer
        const finalY = yPos + 20;
        if (finalY < 280) {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text("© Generated by School Management System", pageWidth / 2, 285, { align: 'center' });
        }

        doc.save(`${exam.title.replace(/\s+/g, '_')}_QuestionPaper.pdf`);
        toast.success("PDF Exported Successfully");
    };

    const filteredExams = exams.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'ended': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20'; // scheduled
        }
    };

    return (
        <TeacherLayout>
            <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                    <div className="absolute -top-24 -left-20 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-4">
                            <BookOpen size={12} className="text-indigo-400" />
                            <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Inventory Management</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tight">
                            My <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic tracking-tighter">Assessments</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium italic">Monitor, edit, and organize your authored question banks.</p>
                    </div>
                    <Link to="/teacher/tests/create" className="group flex items-center gap-3 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        Mint New Test
                    </Link>
                </div>

                {/* Controls & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, subject, or ID..."
                            className="w-full pl-14 pr-6 py-4.5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 text-slate-200 font-bold transition-all placeholder:text-slate-700 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl w-full md:w-auto self-stretch">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex-1 md:px-6 flex items-center justify-center gap-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <LayoutGrid size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Grid</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 md:px-6 flex items-center justify-center gap-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <ListIcon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">List</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-72 bg-slate-900/40 rounded-[2rem] border border-white/5 animate-pulse overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                            </div>
                        ))}
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="text-center py-32 bg-slate-900/20 rounded-[3rem] border-4 border-dashed border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full -m-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="w-24 h-24 bg-indigo-500/10 text-indigo-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative z-10 border border-indigo-500/20 shadow-inner">
                            <BookOpen size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4 relative z-10">Vault is Empty</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium italic relative z-10">No assessments matching your current filter were found in the database.</p>
                        <button onClick={() => {setSearchTerm(''); setViewMode('grid');}} className="mt-8 px-6 py-2 rounded-full border border-indigo-500/30 text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500/10 transition-all relative z-10">Clear Filter</button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredExams.map((exam) => (
                            <div key={exam._id} className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-7 transition-all hover:border-indigo-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
                                
                                {/* Status Orb */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 bg-slate-950/50 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5 group-hover:border-indigo-500/30 transition-all shadow-inner">
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black border tracking-widest uppercase italic ${getStatusColor(exam.status)}`}>
                                            {exam.status}
                                        </span>
                                        {exam.examType === 'proctored' && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                                <ShieldCheck size={10} className="text-amber-500" />
                                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Monitor Pro</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-8 flex-1">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] italic">{exam.subject}</span>
                                    <h3 className="text-2xl font-black text-white mt-1 line-clamp-2 uppercase italic leading-[1] tracking-tight group-hover:text-indigo-100 transition-colors">{exam.title}</h3>
                                    <p className="text-slate-600 text-[10px] mt-3 font-bold uppercase tracking-widest">UID: {exam._id.slice(-8)}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-8">
                                    <div className="flex flex-col items-center justify-center py-4 bg-slate-950/40 rounded-2xl border border-white/5 shadow-inner">
                                        <Clock size={16} className="text-slate-600 mb-2" />
                                        <span className="text-sm font-black text-white italic">{exam.durationMinutes}</span>
                                        <span className="text-[8px] font-black text-slate-600 uppercase mt-0.5 tracking-widest">Mins</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-4 bg-slate-950/40 rounded-2xl border border-white/5 shadow-inner">
                                        <FileText size={16} className="text-slate-600 mb-2" />
                                        <span className="text-sm font-black text-white italic">{exam.questions?.length || 0}</span>
                                        <span className="text-[8px] font-black text-slate-600 uppercase mt-0.5 tracking-widest">Units</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 shadow-inner">
                                        <BarChart2 size={16} className="text-indigo-400/60 mb-2" />
                                        <span className="text-sm font-black text-indigo-400 italic">{exam.totalMarks || 100}</span>
                                        <span className="text-[8px] font-black text-indigo-500/40 uppercase mt-0.5 tracking-widest">Mark</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleStatus(exam._id, exam.status)}
                                        className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${exam.status === 'active' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
                                    >
                                        <Play size={12} fill="currentColor" className={exam.status === 'active' ? 'rotate-90' : ''} />
                                        {exam.status === 'active' ? 'End' : 'Start'}
                                    </button>
                                    
                                    <div className="flex gap-1 p-1 bg-slate-950/60 rounded-xl border border-white/5">
                                        {[
                                            { icon: Monitor, color: 'hover:text-amber-400 hover:bg-amber-400/10', path: `/teacher/exam/${exam._id}/monitor`, title: 'Monitor' },
                                            { icon: Edit, color: 'hover:text-indigo-400 hover:bg-indigo-400/10', path: `/teacher/tests/create?edit=${exam._id}`, title: 'Edit' },
                                            { icon: FileDown, color: 'hover:text-purple-400 hover:bg-purple-400/10', onClick: () => handleExportPDF(exam), title: 'PDF' },
                                            { icon: Trash2, color: 'hover:text-rose-400 hover:bg-rose-400/10', onClick: () => handleDelete(exam._id), title: 'Delete' }
                                        ].map((tool, idx) => (
                                            <button
                                                key={idx}
                                                onClick={tool.onClick || (() => navigate(tool.path))}
                                                className={`p-2.5 text-slate-600 ${tool.color} transition-all rounded-lg`}
                                                title={tool.title}
                                            >
                                                <tool.icon size={16} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/2 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                                    <tr>
                                        <th className="px-8 py-6">Assessment Detail</th>
                                        <th className="px-8 py-6">Subject</th>
                                        <th className="px-8 py-6">Metrics</th>
                                        <th className="px-8 py-6">Protection</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredExams.map((exam) => (
                                        <tr key={exam._id} className="hover:bg-white/2 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center font-black text-sm italic shadow-inner">
                                                        {exam.subject.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white italic uppercase text-sm leading-none tracking-tight">{exam.title}</p>
                                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1.5">UID: {exam._id.slice(-8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest italic">{exam.subject}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4 text-[10px] font-black text-white uppercase tracking-tighter italic">
                                                    <span className="flex items-center gap-1.5 text-slate-400"><Clock size={12} /> {exam.durationMinutes}m</span>
                                                    <span className="flex items-center gap-1.5 text-slate-400"><FileText size={12} /> {exam.questions?.length || 0}u</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                 {exam.examType === 'proctored' ? (
                                                     <div className="inline-flex items-center gap-1.5 text-amber-500/80">
                                                         <ShieldCheck size={14} />
                                                         <span className="text-[10px] font-black uppercase tracking-tighter">Proctoring On</span>
                                                     </div>
                                                 ) : (
                                                     <span className="text-[10px] font-bold text-slate-700 uppercase italic">Basic</span>
                                                 )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border ${getStatusColor(exam.status)} uppercase tracking-widest italic`}>
                                                    {exam.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                     <button onClick={() => toggleStatus(exam._id, exam.status)} className={`p-2.5 rounded-xl transition-all ${exam.status === 'active' ? 'text-rose-400 bg-rose-400/10 border border-rose-500/20' : 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20'}`} title={exam.status === 'active' ? 'End' : 'Start'}><Play size={14} fill="currentColor" /></button>
                                                     <button onClick={() => navigate(`/teacher/exam/${exam._id}/monitor`)} className="p-2.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="Monitor"><Monitor size={14} /></button>
                                                     <button onClick={() => navigate(`/teacher/tests/create?edit=${exam._id}`)} className="p-2.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="Edit"><Edit size={14} /></button>
                                                     <button onClick={() => handleDelete(exam._id)} className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all" title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </TeacherLayout >
    );
};

export default TeacherTests;

