import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import TeacherLayout from '../components/TeacherLayout';
import { CheckCircle, AlertCircle, Clock, ArrowRight, User, BookOpen, Search, Filter, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const GradingDashboard = () => {
    const { token } = useSelector((state) => state.auth);
    const [gradingList, setGradingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [gradeData, setGradeData] = useState({}); // { questionIndex: marks }

    useEffect(() => {
        if (token) fetchGradingList();
    }, [token]);

    const fetchGradingList = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:2000/exam/grading/list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGradingList(res.data);
        } catch (error) {
            toast.error("Failed to load grading list");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGrading = (session) => {
        setSelectedSession(session);
        // Pre-fill existing marks if any
        const existingMarks = {};
        session.essayAnswers?.forEach(ans => {
            existingMarks[ans.questionIndex] = ans.marksEarned || 0;
        });
        setGradeData(existingMarks);
    };

    const handleSubmitGrade = async () => {
        const loadingToast = toast.loading("Submitting grades...");
        try {
            await axios.post('http://localhost:2000/exam/grading/submit', {
                sessionId: selectedSession._id,
                grades: Object.entries(gradeData).map(([qIdx, marks]) => ({
                    questionIndex: parseInt(qIdx),
                    marksEarned: parseFloat(marks)
                }))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Grades submitted successfully", { id: loadingToast });
            setSelectedSession(null);
            fetchGradingList();
        } catch (error) {
            toast.error("Failed to submit grades", { id: loadingToast });
        }
    };

    return (
        <TeacherLayout>
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-gold-50 border border-[#D4AF37]/20 rounded-full px-3 py-1 mb-4">
                            <Clock size={12} className="text-[#D4AF37]" />
                            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">Pending Evaluations</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 italic tracking-tight uppercase">
                            Manual <span className="gold-text-gradient">Grading</span> Hub
                        </h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Review and score essay submissions with precision.</p>
                    </div>
                </div>

                {/* Main Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Submissions...</p>
                    </div>
                ) : gradingList.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-20 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gold-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-[#D4AF37]" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Queue Clear</h3>
                        <p className="text-slate-500 text-sm">No pending essay submissions require manual grading at this time.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gradingList.map((item) => (
                            <div key={item._id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:border-[#D4AF37]/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-gold-500/5 cursor-pointer relative overflow-hidden" onClick={() => handleOpenGrading(item)}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-50/50 blur-3xl rounded-full -translate-y-12 translate-x-12 group-hover:bg-[#D4AF37]/20 transition-colors" />
                                
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-[#1A120B] group-hover:text-[#D4AF37] transition-all">
                                        <BookOpen size={20} />
                                    </div>
                                    <span className="px-3 py-1 bg-gold-50 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest rounded-full">Manual Review</span>
                                </div>

                                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:gold-text-gradient transition-all">{item.examTitle}</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">{item.subject} • {item.classLevel}</p>

                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                                <User size={14} />
                                            </div>
                                            <span className="text-xs font-black text-slate-700">{item.studentName}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(item.completedAt).toLocaleDateString()}</span>
                                    </div>
                                    <button className="w-full py-3 bg-slate-50 hover:bg-[#1A120B] text-slate-600 hover:text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
                                        Grade Session <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Grading Modal */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A120B]/60 backdrop-blur-md" onClick={() => setSelectedSession(null)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                                    Grading: <span className="gold-text-gradient">{selectedSession.studentName}</span>
                                </h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                    {selectedSession.examTitle} • {selectedSession.essayAnswers?.length} Pending Items
                                </p>
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all shadow-inner">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-10 max-h-[70vh] overflow-y-auto space-y-10 custom-scrollbar">
                            {selectedSession.essayAnswers?.map((ans, idx) => (
                                <div key={idx} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="w-10 h-10 rounded-2xl bg-[#1A120B] text-[#D4AF37] flex items-center justify-center text-xs font-black italic shadow-xl">#{ans.questionIndex + 1}</span>
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Evaluation Point</h3>
                                    </div>
                                    
                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-6">
                                        <div>
                                            <label className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.25em] mb-2 block">Student Response</label>
                                            <p className="text-slate-700 text-lg font-medium leading-relaxed italic">{ans.answer || 'No response provided.'}</p>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-slate-200/50">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score Assignment</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        max={ans.maxMarks}
                                                        min="0"
                                                        step="0.5"
                                                        value={gradeData[ans.questionIndex] || 0}
                                                        onChange={(e) => setGradeData({ ...gradeData, [ans.questionIndex]: e.target.value })}
                                                        className="w-24 px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-[#D4AF37] outline-none font-black text-[#D4AF37] transition-all text-center"
                                                    />
                                                    <span className="text-slate-300 font-bold italic">/ {ans.maxMarks} Points</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {[0, 0.5, 1].map(mult => (
                                                    <button 
                                                        key={mult}
                                                        onClick={() => setGradeData({ ...gradeData, [ans.questionIndex]: ans.maxMarks * mult })}
                                                        className="px-4 py-2 bg-white border border-slate-100 text-slate-500 text-[10px] font-black rounded-lg hover:bg-gold-50 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all shadow-sm"
                                                    >
                                                        {mult === 0 ? 'Zero' : mult === 0.5 ? 'Half' : 'Full'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4 sticky bottom-0">
                            <button onClick={() => setSelectedSession(null)} className="px-8 py-3.5 bg-white text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleSubmitGrade} className="btn-primary py-3.5! px-10! text-[11px]!">
                                <Save size={16} /> Finalize Grade
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
};

export default GradingDashboard;
