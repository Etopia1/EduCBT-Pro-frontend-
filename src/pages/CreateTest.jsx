import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Image as ImageIcon, X, Save, ArrowLeft, CheckCircle2, AlertCircle, Clock, BookOpen, Key, LayoutGrid, FileText } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';
import toast from 'react-hot-toast';

const CreateTest = () => {
    const { token, user: authUser } = useSelector((state) => state.auth);
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState(null);

    const [examData, setExamData] = useState({
        title: '',
        subject: '',
        classLevel: '', // JSS1, JSS2, JSS3, SS1, SS2, SS3
        durationMinutes: 30,
        totalMarks: 100,
        accessCode: '',
        questions: [
            { text: '', options: ['', '', '', ''], correctOptions: [0], imageUrl: '' }
        ],
        examType: 'basic', // basic or proctored
        proctoringSettings: {
            requireCamera: false,
            requireAudio: false,
            detectViolations: false,
            lockBrowser: false,
            screenSharing: false,
            faceDetection: false,
            tabSwitchLimit: 0
        }
    });

    const [canMonitor, setCanMonitor] = useState(false); // Controlled by subscription

    useEffect(() => {
        if (token) {
            fetchTeacherProfile();
            if (editId) fetchExamForEdit();
        }
    }, [token, editId]);

    const fetchExamForEdit = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:2000/exam/${editId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure questions have all necessary fields
            const formattedQuestions = res.data.questions.map(q => ({
                ...q,
                options: q.options || ['', '', '', ''],
                correctOptions: q.correctOptions || [0],
                imageUrl: q.imageUrl || ''
            }));

            setExamData({
                ...res.data,
                questions: formattedQuestions
            });
        } catch (error) {
            console.error("Error fetching exam:", error);
            toast.error("Failed to load test for editing");
            navigate('/teacher/tests');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeacherProfile = async () => {
        try {
            const res = await axios.get('http://localhost:2000/school/teacher/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeacherProfile(res.data);

            // Check Subscription Status for Monitoring Access
            if (res.data.subscription && res.data.subscription.canMonitor) {
                setCanMonitor(true);
            } else {
                setCanMonitor(false);
            }

            // Only set default subject if NOT editing
            if (!editId && res.data.info?.subjects?.length > 0) {
                setExamData(prev => ({ ...prev, subject: res.data.info.subjects[0] }));
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleChange = (e) => {
        setExamData({ ...examData, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...examData.questions];
        newQuestions[index][field] = value;
        setExamData({ ...examData, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...examData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setExamData({ ...examData, questions: newQuestions });
    };

    const addQuestion = () => {
        setExamData({
            ...examData,
            questions: [...examData.questions, { text: '', options: ['', '', '', ''], correctOptions: [0], imageUrl: '' }]
        });
    };

    const addOption = (qIndex) => {
        const newQuestions = [...examData.questions];
        if (newQuestions[qIndex].options.length >= 6) {
            toast.error("Maximum 6 options allowed");
            return;
        }
        newQuestions[qIndex].options.push('');
        setExamData({ ...examData, questions: newQuestions });
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...examData.questions];
        if (newQuestions[qIndex].options.length <= 2) {
            toast.error("Minimum 2 options required");
            return;
        }

        // Remove option
        newQuestions[qIndex].options.splice(oIndex, 1);

        // Adjust correctOptions indices
        newQuestions[qIndex].correctOptions = newQuestions[qIndex].correctOptions
            .filter(idx => idx !== oIndex)
            .map(idx => idx > oIndex ? idx - 1 : idx);

        // Ensure at least one correct option exists if we removed the only one
        if (newQuestions[qIndex].correctOptions.length === 0) {
            newQuestions[qIndex].correctOptions = [0];
        }

        setExamData({ ...examData, questions: newQuestions });
    };

    const toggleCorrectOption = (qIndex, oIndex) => {
        const newQuestions = [...examData.questions];
        const correctOnes = newQuestions[qIndex].correctOptions || [];

        if (correctOnes.includes(oIndex)) {
            if (correctOnes.length === 1) {
                toast.error("At least one correct option is required");
                return;
            }
            newQuestions[qIndex].correctOptions = correctOnes.filter(idx => idx !== oIndex);
        } else {
            newQuestions[qIndex].correctOptions = [...correctOnes, oIndex];
        }

        setExamData({ ...examData, questions: newQuestions });
    };

    const removeQuestion = (index) => {
        if (examData.questions.length === 1) {
            toast.error("At least one question is required");
            return;
        }
        const newQuestions = examData.questions.filter((_, i) => i !== index);
        setExamData({ ...examData, questions: newQuestions });
    };

    const handleImageUpload = async (index, file) => {
        if (!file) return;

        const loadingToast = toast.loading("Uploading image...");
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('http://localhost:2000/exam/teacher/upload-image', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            handleQuestionChange(index, 'imageUrl', res.data.imageUrl);
            toast.success("Image uploaded", { id: loadingToast });
        } catch (error) {
            toast.error("Upload failed", { id: loadingToast });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!examData.title || !examData.subject || !examData.classLevel) {
            toast.error("Please fill in all basic details including class level");
            return;
        }

        const isQuestionsValid = examData.questions.every(q =>
            q.text &&
            q.options.every(o => o.trim() !== '') &&
            q.correctOptions && q.correctOptions.length > 0
        );

        if (!isQuestionsValid) {
            toast.error("Please fill in all questions, options, and select correct answers");
            return;
        }

        setLoading(true);
        try {
            if (editId) {
                await axios.put(`http://localhost:2000/exam/${editId}`, examData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Test updated successfully!');
            } else {
                await axios.post('http://localhost:2000/exam/create', examData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Test created successfully!');
            }
            navigate('/teacher/tests');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create test");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TeacherLayout>
            <div className="max-w-5xl mx-auto pb-20 space-y-10 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-4">
                            <Plus size={12} className="text-indigo-400" />
                            <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Assessment Creator</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tight">
                            {editId ? 'Edit' : 'Create'} <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic">Masterpiece</span> Test
                        </h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium italic">Craft a secure and engaging assessment for your students.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/teacher/tests')}
                            className="px-5 py-2.5 rounded-xl border border-white/5 bg-slate-800/40 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            <Save size={14} /> {loading ? 'Saving...' : 'Publish Test'}
                        </button>
                    </div>
                </div>

                {/* Step 1: Basic Info */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                    
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
                            <LayoutGrid size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white italic">Assessment Essentials</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Specify the core details of your test</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Assessment Title</label>
                            <div className="relative group/input">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="text" name="title" placeholder="e.g. Mid-Term Geometry Quiz"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all font-bold text-slate-200 placeholder:text-slate-700"
                                    value={examData.title} onChange={handleChange} required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Subject Category</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <select
                                    name="subject"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all font-bold text-slate-200 appearance-none cursor-pointer"
                                    value={examData.subject} onChange={handleChange} required
                                >
                                    <option value="" className="bg-slate-900">Select Subject</option>
                                    {teacherProfile?.info?.subjects?.map(s => (
                                        <option key={s} value={s} className="bg-slate-900">{s}</option>
                                    ))}
                                    <option value="General" className="bg-slate-900">General</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Duration (Mins)</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input
                                        type="number" name="durationMinutes"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all font-bold text-slate-200"
                                        value={examData.durationMinutes} onChange={handleChange} required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Access Code</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input
                                        type="text" name="accessCode" placeholder="Optional"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all font-bold text-slate-200 uppercase tracking-widest placeholder:text-slate-700"
                                        value={examData.accessCode} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Class Level</label>
                            <select
                                name="classLevel"
                                className="w-full px-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all font-bold text-slate-200 appearance-none cursor-pointer"
                                value={examData.classLevel} onChange={handleChange} required
                            >
                                <option value="" className="bg-slate-900">Select Class</option>
                                {['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'].map(c => (
                                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Security Selection */}
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-sm font-black text-slate-300 italic mb-6">Execution Mode</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div
                                onClick={() => setExamData({ ...examData, examType: 'basic' })}
                                className={`group/mode relative rounded-2xl border-2 p-6 transition-all cursor-pointer ${examData.examType === 'basic' ? 'border-indigo-600 bg-indigo-600/5' : 'border-white/5 bg-slate-950/30 hover:border-white/10'}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                     <div className={`p-2.5 rounded-xl ${examData.examType === 'basic' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        <LayoutGrid size={18} />
                                     </div>
                                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${examData.examType === 'basic' ? 'border-indigo-600' : 'border-slate-700'}`}>
                                        {examData.examType === 'basic' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_8px_#4f46e5]" />}
                                     </div>
                                </div>
                                <h4 className="font-black text-white italic tracking-tight mb-2">Standard Mode</h4>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">Classic exam format. Students focus solely on questions without strict monitoring.</p>
                            </div>

                            <div
                                onClick={() => {
                                    if (canMonitor) {
                                        setExamData({ ...examData, examType: 'proctored' });
                                    } else {
                                        toast.error("Premium upgrade required for Monitor Mode");
                                    }
                                }}
                                className={`group/mode relative rounded-2xl border-2 p-6 transition-all ${!canMonitor ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'} ${examData.examType === 'proctored' ? 'border-amber-500 bg-amber-500/5' : 'border-white/5 bg-slate-950/30'}`}
                            >
                                {!canMonitor && (
                                    <div className="absolute top-4 right-4 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20 z-10 animate-pulse">
                                        UPGRADE
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                     <div className={`p-2.5 rounded-xl ${examData.examType === 'proctored' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        <AlertCircle size={18} />
                                     </div>
                                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${examData.examType === 'proctored' ? 'border-amber-500' : 'border-slate-700'}`}>
                                        {examData.examType === 'proctored' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />}
                                     </div>
                                </div>
                                <h4 className="font-black text-white italic tracking-tight mb-2">Monitor Pro</h4>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed italic">AI-powered proctoring, face tracking, and browser locking for high-stakes tests.</p>
                            </div>
                        </div>
                    </div>

                    {/* Proctoring Settings */}
                    {examData.examType === 'proctored' && (
                        <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[1.5rem] space-y-6 animate-in slide-in-from-top-2 duration-500">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Premium Security Engine Active</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { key: 'requireCamera', label: 'Face Tracking' },
                                    { key: 'requireAudio', label: 'Audio Detection' },
                                    { key: 'screenSharing', label: 'Screen Mirror' },
                                    { key: 'lockBrowser', label: 'Tab Lockdown' }
                                ].map((setting) => (
                                    <label key={setting.key} className="relative flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl cursor-pointer hover:border-amber-500/30 transition-all group/opt">
                                        <span className="text-xs font-black text-slate-300 italic group-hover/opt:text-amber-400 transition-colors uppercase tracking-tight">{setting.label}</span>
                                        <input
                                            type="checkbox"
                                            checked={examData.proctoringSettings[setting.key]}
                                            onChange={(e) => setExamData({
                                                ...examData,
                                                proctoringSettings: {
                                                    ...examData.proctoringSettings,
                                                    [setting.key]: e.target.checked
                                                }
                                            })}
                                            className="w-5 h-5 rounded bg-slate-900 border-white/10 text-amber-500 focus:ring-amber-500/30"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 2: Questions */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                                <BookOpen size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white italic">Questions Ledger</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Inventory of assessment items</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                             <span className="text-2xl font-black text-indigo-500 tracking-tighter italic">{examData.questions.length}</span>
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Total Units</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {examData.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
                                <div className="bg-white/2 px-8 py-4 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                         <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-600/20 italic">#{qIndex + 1}</span>
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Question Entry</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Question Text & Image */}
                                    <div className="space-y-4">
                                        <div className="relative group/q">
                                            <textarea
                                                placeholder="Describe the question context..."
                                                className="w-full px-6 py-5 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all font-bold text-slate-200 placeholder:text-slate-700 resize-none min-h-[120px] shadow-inner"
                                                value={q.text}
                                                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                                required
                                            />
                                            <label className="absolute bottom-5 right-5 cursor-pointer flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-slate-300 transition-colors border border-white/5 shadow-xl">
                                                <input
                                                    type="file" accept="image/*" className="hidden"
                                                    onChange={(e) => handleImageUpload(qIndex, e.target.files[0])}
                                                />
                                                <ImageIcon size={14} className="group-hover/q:text-indigo-400 transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Attach Media</span>
                                            </label>
                                        </div>

                                        {q.imageUrl && (
                                            <div className="relative inline-block group/img">
                                                <img src={q.imageUrl} alt="Q" className="max-h-56 rounded-2xl border border-white/10 ring-4 ring-slate-950" />
                                                <button
                                                    onClick={() => handleQuestionChange(qIndex, 'imageUrl', '')}
                                                    className="absolute -top-3 -right-3 bg-rose-600 text-white p-1.5 rounded-full shadow-xl hover:bg-rose-500 group-hover/img:scale-110 transition-all border-4 border-slate-950"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Options Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {q.options.map((option, oIndex) => (
                                            <div key={oIndex} className="relative group/opt">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
                                                     <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${q.correctOptions.includes(oIndex) ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                                                        {String.fromCharCode(65 + oIndex)}
                                                     </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                    className={`w-full pl-14 pr-12 py-4 bg-slate-950/50 border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-200 placeholder:text-slate-700 ${q.correctOptions.includes(oIndex) ? 'border-indigo-600/40 ring-2 ring-indigo-600/10' : 'border-white/5'}`}
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCorrectOption(qIndex, oIndex)}
                                                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${q.correctOptions.includes(oIndex) ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-600 hover:text-slate-400'}`}
                                                >
                                                    <CheckCircle2 size={18} fill={q.correctOptions.includes(oIndex) ? 'currentColor' : 'none'} fillOpacity={0.2} />
                                                </button>
                                            </div>
                                        ))}

                                        {q.options.length < 6 && (
                                            <button
                                                type="button"
                                                onClick={() => addOption(qIndex)}
                                                className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-bold hover:border-indigo-200 hover:text-indigo-500 transition-all"
                                            >
                                                <Plus size={16} /> Add Option
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-6 rounded-[2rem] border-2 border-dashed border-white/5 bg-slate-900/20 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-slate-900/40 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 group/add"
                    >
                        <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover/add:bg-indigo-600 group-hover/add:text-white flex items-center justify-center transition-all">
                            <Plus size={18} />
                        </div>
                        Mint New Question Unit
                    </button>
                </div>

                {/* Submit Sticky Bar for Mobile */}
                <div className="md:hidden sticky bottom-4 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 mx-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">{examData.questions.length} Items Locked</span>
                     <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                     >
                        {loading ? 'Processing...' : 'Sync & Publish'}
                     </button>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default CreateTest;
