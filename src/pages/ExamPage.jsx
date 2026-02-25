import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import WebcamMonitor from '../components/Proctoring/WebcamMonitor';
import MicMonitor from '../components/Proctoring/MicMonitor';
import io from 'socket.io-client';
import { 
    CheckCircle2, Clock, BookOpen, Sparkles, Activity, AlertCircle, 
    ArrowLeft, ArrowRight, Shield, Zap, Monitor, LayoutGrid, X,
    ChevronLeft, ChevronRight, FileCheck, Lock, Unlock, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const socket = io('http://localhost:2000');

const ExamPage = () => {
    const { user, token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const { examId } = useParams();
    const [exam, setExam] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [sessionId, setSessionId] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [warning, setWarning] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [lockReason, setLockReason] = useState('');
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const [result, setResult] = useState(null);

    // Track continuous violations
    const [violationCount, setViolationCount] = useState(0);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [talkingViolationCount, setTalkingViolationCount] = useState(0);
    const violationTimeout = useRef(null);

    // Proctoring monitoring states
    const [stream, setStream] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [headPosition, setHeadPosition] = useState({ x: 0, y: 0 });
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const headTrackingRef = useRef({ lastPosition: null, movementCount: 0, talkingCount: 0 });
    const [showScreenShareInstruction, setShowScreenShareInstruction] = useState(false);
    const screenShareAttempts = useRef(0);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const examRes = await axios.get(`http://localhost:2000/exam/${examId}`, { headers });
                const fetchedExam = examRes.data;
                setExam(fetchedExam);
                setTimeLeft(fetchedExam.durationMinutes * 60);

                const sessionRes = await axios.post('http://localhost:2000/exam/start',
                    { examId: fetchedExam._id },
                    { headers }
                );
                const newSessionId = sessionRes.data.sessionId || sessionRes.data._id || 'mock-session';
                setSessionId(newSessionId);

                if (sessionRes.data.isLocked) {
                    setIsLocked(true);
                    setLockReason(sessionRes.data.lockReason || 'Exam locked by teacher');
                    toast.error('This exam has been locked!', { icon: '🔒' });
                }

                setTimeout(() => enterFullscreen(), 500);
            } catch (error) {
                toast.error("Failed to load secure environment");
            }
        };
        if (user && token && examId) fetchExamData();
    }, [user, token, examId]);

    useEffect(() => {
        if (!exam || !sessionId || submitted) return;
        socket.emit('enter_exam_room', exam._id);
        socket.emit('join_session', sessionId);

        socket.on('exam_terminated', (data) => {
            toast.error("Session terminated by architect", { icon: '🛑' });
            setSubmitted(true);
            if (sessionId && sessionId !== 'mock-session') {
                axios.post('http://localhost:2000/exam/submit', { sessionId, answers }, { headers })
                    .finally(() => setTimeout(() => cleanupAndRedirect(), 3000));
            } else {
                setTimeout(() => cleanupAndRedirect(), 3000);
            }
        });

        socket.on('session_locked', (data) => {
            setIsLocked(true);
            setLockReason(data.reason || 'Architect protocol engaged');
            toast.error("🔒 Security Lock Engaged", { style: { background: '#dc2626', color: '#fff' } });
        });

        socket.on('session_unlocked', () => {
            setIsLocked(false);
            setLockReason('');
            toast.success("✅ Access Restored", { icon: '🔓' });
        });

        return () => {
            socket.off('exam_terminated');
            socket.off('session_locked');
            socket.off('session_unlocked');
        };
    }, [exam, sessionId, submitted, answers, token]);

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => toast("Please enable Fullscreen", { icon: '🖥️' }));
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && exam && !submitted) {
                toast.error("Fullscreen exit detected");
                handleViolation('fullscreen_exit');
                setTimeout(() => enterFullscreen(), 1000);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [exam, submitted]);

    useEffect(() => {
        if (!exam || submitted || exam.examType !== 'proctored') return;

        const initializeProctoring = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);

                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioSource = audioContext.createMediaStreamSource(mediaStream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                audioSource.connect(analyser);
                audioContextRef.current = audioContext;
                analyserRef.current = analyser;

                // Screen share protocol
                toast('📺 Selection: ENTIRE SCREEN required', { icon: '⚠️' });
                await new Promise(r => setTimeout(r, 1500));
                
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { displaySurface: "monitor", cursor: "always" },
                    audio: false
                });

                const settings = screenStream.getVideoTracks()[0].getSettings();
                if (settings.displaySurface !== "monitor") {
                    screenStream.getTracks().forEach(t => t.stop());
                    screenShareAttempts.current += 1;
                    if (screenShareAttempts.current < 2) {
                        toast.error("INVALID SELECTION. One attempt remaining.");
                        setShowScreenShareInstruction(true);
                        setTimeout(() => setShowScreenShareInstruction(false), 3000);
                        return;
                    } else {
                        lockExam("Failed screen sharing protocol");
                        return;
                    }
                }

                screenStream.getVideoTracks()[0].onended = () => lockExam("Screen share terminated");

                // WebRTC Uplink (Simplified for UI task)
                const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
                screenStream.getTracks().forEach(track => pc.addTrack(track, screenStream));
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('screen_offer', { examId: exam._id, sessionId, offer });

            } catch (err) {
                toast.error("Secure uplink failed. Enable hardware access.");
            }
        };

        initializeProctoring();
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [exam, submitted]);

    useEffect(() => {
        if (timeLeft > 0 && !isLocked && !submitted) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && exam && !submitted) {
            handleSubmit();
        }
    }, [timeLeft, isLocked, submitted, exam]);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden && !isLocked && !submitted) handleViolation('tab_switch');
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [sessionId, isLocked, submitted]);

    useEffect(() => {
        const prevent = (e) => e.preventDefault();
        document.addEventListener('contextmenu', prevent);
        document.addEventListener('copy', prevent);
        document.addEventListener('paste', prevent);
        return () => {
            document.removeEventListener('contextmenu', prevent);
            document.removeEventListener('copy', prevent);
            document.removeEventListener('paste', prevent);
        }
    }, []);

    const handleViolation = useCallback(async (type) => {
        if (isLocked || submitted) return;
        await recordViolation(type);

        if (type === 'tab_switch') {
            toast.error('TAB SWITCH DETECTED. Critical breach.', { icon: '🚫' });
            lockExam('Tab switch violation');
        } else if (type === 'ai_voice_detected' || type === 'excessive_talking') {
            setTalkingViolationCount(prev => {
                const n = prev + 1;
                if (n >= 5) lockExam('Acoustic violation');
                else toast.error(`Acoustic Warning ${n}/5`, { icon: '🔇' });
                return n;
            });
        } else {
            setWarning(`Protocol breach: ${type.replace('_', ' ')}`);
            setTimeout(() => setWarning(null), 3000);
        }
    }, [isLocked, submitted]);

    const clearViolationTimer = () => {
        if (violationTimeout.current) {
            clearTimeout(violationTimeout.current);
            violationTimeout.current = null;
            setWarning(null);
        }
    };

    const cleanupAndRedirect = useCallback(() => {
        if (stream) stream.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        if (document.fullscreenElement) document.exitFullscreen();
        socket.disconnect();
        navigate('/student/dashboard');
    }, [stream, navigate]);

    const recordViolation = async (type) => {
        if (!sessionId || sessionId === 'mock-session') return;
        try {
            await axios.post('http://localhost:2000/exam/violation/log', { sessionId, type }, { headers });
            socket.emit('report_violation', { sessionId, type, examId: exam._id });
        } catch {}
    };

    const lockExam = async (reason) => {
        setIsLocked(true);
        setLockReason(reason);
        await recordViolation(`LOCKED: ${reason}`);
    };

    const handleAnswer = (optionIndex) => {
        const currentArr = answers[currentQuestion] || [];
        const newArr = currentArr.includes(optionIndex) 
            ? currentArr.filter(i => i !== optionIndex) 
            : [...currentArr, optionIndex];
        setAnswers({ ...answers, [currentQuestion]: newArr });
    };

    const handleSubmit = async () => {
        if (!sessionId || sessionId === 'mock-session') return;
        const unanswered = exam.questions.length - Object.keys(answers).length;
        if (unanswered > 0 && !window.confirm(`Submit with ${unanswered} empty indices?`)) return;

        setSubmitted(true);
        const tid = toast.loading("Encrypting submissions...");
        try {
            const res = await axios.post('http://localhost:2000/exam/submit', { sessionId, answers }, { headers });
            setResult(res.data);
            toast.success("Submissions accepted", { id: tid });
            if (document.fullscreenElement) document.exitFullscreen();

            let countdown = 5;
            const iv = setInterval(() => {
                countdown--;
                setRedirectCountdown(countdown);
                if (countdown <= 0) { clearInterval(iv); cleanupAndRedirect(); }
            }, 1000);
        } catch (err) {
            toast.error("Uplink failed", { id: tid });
            setSubmitted(false);
        }
    };

    // ─── Loading State ───
    if (!exam) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500 blur-[150px] rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-8 relative z-10 text-center">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={32} />
                </div>
                <div className="space-y-2">
                    <p className="text-white font-black uppercase tracking-[0.3em] text-sm italic animate-pulse">Initializing Secure Matrix</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Verifying Proctor Protocols · Establishing Neural Link</p>
                </div>
            </div>
        </div>
    );

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = (Object.keys(answers).length / exam.questions.length) * 100;

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden">
            {/* 🔒 OVERLAYS */}
            {exam?.examType === 'proctored' && (
                <>
                    <WebcamMonitor
                        studentId={user?._id}
                        onViolation={(type) => (type === 'face_not_visible' || type === 'multiple_faces' || type === 'looking_away') ? handleViolation(type) : clearViolationTimer()}
                    />
                    <MicMonitor onViolation={handleViolation} />
                </>
            )}

            {warning && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-rose-600/90 backdrop-blur-md text-white px-8 py-3 rounded-full shadow-2xl z-[100] font-black uppercase text-xs tracking-widest animate-bounce flex items-center gap-3 border border-rose-400/50">
                    <AlertTriangle size={16} />
                    {warning}
                </div>
            )}

            {isLocked && (
                <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
                    <div className="w-24 h-24 bg-rose-500/20 border border-rose-500/30 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-rose-500/20">
                        <Lock size={48} className="text-rose-500 animate-pulse" />
                    </div>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Secure Lockdown</h1>
                    <p className="text-rose-500 font-bold uppercase tracking-widest text-sm mb-12">Protocol Violation Detected: {lockReason}</p>
                    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl max-w-md w-full">
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
                            The architect has suspended your session. Hardware monitoring is still active. Contact your supervisor for re-authorization.
                        </p>
                        <button onClick={() => navigate('/student/dashboard')} className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95">
                            Relinquish Session
                        </button>
                    </div>
                </div>
            )}

            {/* ── HEADER ── */}
            <header className="h-20 shrink-0 border-b border-white/5 bg-slate-900/40 backdrop-blur-2xl flex items-center px-8 relative z-50">
                <div className="flex-1 flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                            <BookOpen size={20} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-white font-black uppercase italic tracking-tighter truncate text-lg leading-tight">{exam.title}</h1>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{exam.subject} · {exam.classLevel} Node</p>
                        </div>
                    </div>
                    
                    <div className="hidden lg:flex flex-1 max-w-md items-center gap-4 ml-10">
                        <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-700" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{Math.round(progress)}% Index</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {exam.examType === 'proctored' && (
                        <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${stream ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-rose-400'}`}>
                            <Activity size={14} className={stream ? 'animate-pulse' : ''} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{stream ? 'Monitoring' : 'Offline'}</span>
                        </div>
                    )}
                    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all ${timeLeft < 300 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' : 'bg-white/5 border-white/10 text-white'}`}>
                        <Clock size={18} />
                        <span className="text-xl font-black italic tracking-tighter tabular-nums">
                            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </header>

            {/* ── MAIN WORKSPACE ── */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* Left Navigator Sidebar */}
                <aside className="w-24 shrink-0 border-r border-white/5 bg-slate-900/40 p-4 space-y-3 overflow-y-auto no-scrollbar">
                   {exam.questions.map((_, idx) => (
                       <button
                           key={idx}
                           onClick={() => setCurrentQuestion(idx)}
                           className={`w-full aspect-square rounded-xl text-[10px] font-black transition-all flex items-center justify-center border ${
                               currentQuestion === idx 
                               ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                               : answers[idx] 
                               ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                               : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
                           }`}>
                           {(idx + 1).toString().padStart(2, '0')}
                       </button>
                   ))}
                </aside>

                <div className="flex-1 overflow-y-auto p-12 bg-slate-950 relative">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {!submitted ? (
                            <>
                                <div className="space-y-6 animate-in slide-in-from-left-8 duration-700">
                                    <div className="flex items-center gap-4">
                                        <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">Question {currentQuestion + 1} of {exam.questions.length}</span>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>
                                    <h2 className="text-3xl font-black text-white italic tracking-tight leading-tight uppercase">
                                        {exam.questions[currentQuestion].text}
                                    </h2>
                                    {exam.questions[currentQuestion].imageUrl && (
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <img src={exam.questions[currentQuestion].imageUrl} alt="Asset" className="relative rounded-3xl border border-white/10 shadow-2xl max-h-80 w-auto" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-1000 delay-200">
                                    {exam.questions[currentQuestion].options.map((option, idx) => {
                                        const isSelected = answers[currentQuestion]?.includes(idx);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswer(idx)}
                                                className={`group flex items-center justify-between p-6 rounded-[1.5rem] border transition-all duration-300 ${
                                                    isSelected 
                                                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-lg' 
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                                                }`}>
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-950 border-white/5 text-slate-500 group-hover:border-white/20'}`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="font-bold text-lg italic tracking-tight uppercase">{option}</span>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-400 scale-110' : 'border-white/5'}`}>
                                                    {isSelected && <Sparkles size={12} className="text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between pt-12 border-t border-white/5">
                                    <button
                                        disabled={currentQuestion === 0}
                                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                                        className="h-14 flex items-center gap-4 px-8 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-20 active:scale-95">
                                        <ChevronLeft size={18} /> Previous
                                    </button>
                                    
                                    {currentQuestion < exam.questions.length - 1 ? (
                                        <button
                                            onClick={() => setCurrentQuestion(prev => prev + 1)}
                                            className="h-14 flex items-center gap-4 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group">
                                            Advance Node <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            className="h-14 flex items-center gap-4 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-600/20 active:scale-95 group">
                                            Finalize Matrix <FileCheck size={18} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="max-w-md mx-auto py-12 text-center space-y-10 animate-in zoom-in-95 duration-1000">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20" />
                                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto relative z-10 shadow-2xl shadow-emerald-500/30">
                                        <CheckCircle2 size={48} />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Protocol Completed</h2>
                                    <p className="text-slate-500 font-medium italic">Neural link severed successfully. Data integration in progress.</p>
                                </div>

                                {result ? (
                                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-10 pointer-events-none opacity-5">
                                            <Award size={120} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Efficacy Metric</p>
                                            <div className="text-7xl font-black text-white italic tracking-tighter">
                                                {result.score}<span className="text-2xl text-slate-700 ml-1">/{result.total}</span>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-black text-xs uppercase tracking-widest">
                                            <Zap size={14} />
                                            {result.percentage}% Precision
                                        </div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest pt-4">Result Matrix Resolved · ID #{sessionId?.slice(-6)}</p>
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center gap-6">
                                        <div className="w-12 h-12 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
                                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Calculating cognitive delta...</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Redirect Sequence</span>
                                        <span className="text-indigo-400 font-black italic tracking-tighter text-xl tabular-nums">{redirectCountdown}s</span>
                                    </div>
                                    <button
                                        onClick={() => cleanupAndRedirect()}
                                        className="w-full h-14 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl">
                                        Exit Environment Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Instruction Overlay */}
            {showScreenShareInstruction && (
                <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-[300] flex items-center justify-center p-8 animate-in zoom-in-95 duration-500">
                    <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full" />
                        <div className="text-center space-y-8 relative z-10">
                            <div className="w-20 h-20 mx-auto bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/20 text-white">
                                <Monitor size={40} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase">Uplink Required</h1>
                                <p className="text-slate-500 font-semibold italic max-w-md mx-auto leading-relaxed">Security protocols require a complete screen broadcast. Failure to comply will terminate the neural link.</p>
                            </div>
                            
                            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col gap-6 text-left">
                                {[
                                    { step: '1', title: 'Acknowledge Prompt', desc: 'Secure browser dialog will reappear.' },
                                    { step: '2', title: 'Entire Screen', desc: 'Selection of individual windows is prohibited.', active: true },
                                    { step: '3', title: 'Confirm Broadcast', desc: 'Initialize continuous monitoring link.' }
                                ].map((s) => (
                                    <div key={s.step} className="flex gap-6 items-start">
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-sm ${s.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-200 text-slate-500'}`}>{s.step}</div>
                                        <div>
                                            <p className={`font-black text-sm uppercase tracking-widest ${s.active ? 'text-slate-950' : 'text-slate-400'}`}>{s.title}</p>
                                            <p className="text-xs text-slate-500 font-medium italic mt-1">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex flex-col items-center gap-3">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150" />
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-300" />
                                </div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Re-initializing protocols...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamPage;
