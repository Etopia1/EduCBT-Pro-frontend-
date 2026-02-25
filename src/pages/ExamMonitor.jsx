import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import TeacherLayout from '../components/TeacherLayout';
import { Users, Lock, Unlock, XCircle, AlertTriangle, CheckCircle, Clock, Eye, MonitorPlay } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import StudentScreen from '../components/Proctoring/StudentScreen';

const socket = io('https://educbt-pro-backend.onrender.com');

const ExamMonitor = () => {
    const { examId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [studentOffers, setStudentOffers] = useState({});

    useEffect(() => {
        fetchExamDetails();
        fetchSessions();

        // Join monitoring room
        socket.emit('join_monitor', examId);

        const interval = setInterval(fetchSessions, 5000);

        socket.on('violation_logged', (data) => {
            console.log('Violation logged:', data);
            fetchSessions();
        });

        socket.on('session_updated', () => {
            fetchSessions();
        });

        // Handle incoming screen offers
        socket.on('student_screen_offer', (data) => {
            console.log("Received Screen Offer:", data);
            console.log("SessionId from offer:", data.sessionId);
            console.log("Current sessions:", sessions.map(s => ({ _id: s._id, sessionId: s.sessionId })));

            setStudentOffers(prev => ({
                ...prev,
                [data.sessionId]: data
            }));
        });

        return () => {
            clearInterval(interval);
            socket.off('violation_logged');
            socket.off('session_updated');
            socket.off('student_screen_offer');
        };
    }, [examId]);

    const fetchExamDetails = async () => {
        try {
            const res = await axios.get(`https://educbt-pro-backend.onrender.com/exam/${examId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExam(res.data);
        } catch (error) {
            console.error('Error fetching exam:', error);
            toast.error('Failed to load exam details');
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await axios.get(`https://educbt-pro-backend.onrender.com/exam/${examId}/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(res.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async (sessionId) => {
        try {
            await axios.post(`https://educbt-pro-backend.onrender.com/exam/session/${sessionId}/unlock`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Session unlocked successfully');
            fetchSessions();
        } catch (error) {
            toast.error('Failed to unlock session');
        }
    };

    const handleLock = async (sessionId) => {
        const reason = window.prompt('Enter reason for locking (optional):') || 'Locked by teacher';
        try {
            await axios.post(`https://educbt-pro-backend.onrender.com/exam/session/${sessionId}/lock`,
                { reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Session locked successfully');
            fetchSessions();
        } catch (error) {
            toast.error('Failed to lock session');
        }
    };

    const handleForceSubmit = async (sessionId) => {
        const confirmed = window.confirm('Are you sure you want to force submit this student\'s exam? This action cannot be undone.');
        if (!confirmed) return;

        const reason = window.prompt('Enter reason for force submission (optional):');

        try {
            const res = await axios.post(`https://educbt-pro-backend.onrender.com/exam/session/${sessionId}/force-submit`,
                { reason: reason || 'Force submitted due to violations' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Exam force submitted. Score: ${res.data.score}/${exam.totalMarks}`);
            fetchSessions();
        } catch (error) {
            toast.error('Failed to force submit');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
            case 'not_started': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getViolationSeverity = (count) => {
        if (count >= 5) return { color: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle size={16} /> };
        if (count >= 3) return { color: 'text-orange-600', bg: 'bg-orange-100', icon: <AlertTriangle size={16} /> };
        if (count > 0) return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <AlertTriangle size={16} /> };
        return { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle size={16} /> };
    };

    if (loading) {
        return (
            <TeacherLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </TeacherLayout>
        );
    }

    const activeSessions = sessions.filter(s => s.status === 'ongoing' && s.hasStarted);
    const completedSessions = sessions.filter(s => (s.status === 'completed' || s.status === 'terminated') && s.hasStarted);
    const notStartedStudents = sessions.filter(s => !s.hasStarted);

    const getFilteredSessions = () => {
        switch (activeTab) {
            case 'active': return activeSessions;
            case 'not_started': return notStartedStudents;
            case 'completed': return completedSessions;
            default: return sessions;
        }
    };

    const filteredData = getFilteredSessions();

    const renderStudentCard = (session) => {
        if (!session.hasStarted) {
            // Not started card
            return (
                <div key={session.student.id} className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                            {session.student.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-gray-700">{session.student.name}</div>
                            <div className="text-xs text-gray-500">{session.student.classLevel}</div>
                        </div>
                    </div>
                    <div className="text-center py-4">
                        <div className="text-sm text-gray-500 font-semibold">Not Started</div>
                        <div className="text-xs text-gray-400 mt-1">Waiting to begin exam</div>
                    </div>
                </div>
            );
        }

        // Active or completed card
        const severity = getViolationSeverity(session.violationCount);
        return (
            <div
                key={session._id}
                className={`border-2 rounded-xl p-4 ${session.isLocked ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'} hover:shadow-lg transition-all`}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                            {session.student.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">{session.student.name}</div>
                            <div className="text-xs text-gray-500">{session.student.classLevel}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {session.isLocked && <Lock size={16} className="text-red-600" />}
                        <div className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(session.status)}`}>
                            {session.status.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                {/* Progress */}
                {session.status === 'ongoing' && (
                    <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{session.answers}/{session.totalQuestions}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${(session.answers / session.totalQuestions) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Score for completed */}
                {(session.status === 'completed' || session.status === 'terminated') && session.score !== null && (
                    <div className="mb-3 bg-gray-50 rounded-lg p-2">
                        <div className="text-sm text-gray-600">Score</div>
                        <div className="text-2xl font-black text-gray-900">
                            {session.score.toFixed(1)}/{exam.totalMarks}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({session.percentage.toFixed(0)}%)
                            </span>
                        </div>
                    </div>
                )}

                {/* Violations */}
                <div className={`${severity.bg} rounded-lg p-2 mb-3`}>
                    <div className="flex items-center gap-2">
                        {severity.icon}
                        <span className={`text-xs font-bold ${severity.color}`}>
                            {session.violationCount} Violations
                        </span>
                    </div>
                    {session.criticalViolations > 0 && (
                        <div className="text-xs text-red-600 font-semibold mt-1">
                            {session.criticalViolations} Critical
                        </div>
                    )}
                </div>

                {/* Actions */}
                {session.status === 'ongoing' && (
                    <div className="flex flex-col gap-2">
                        {/* Screen Monitor */}
                        {(() => {
                            // Debug logging
                            const sessionIdStr = session._id.toString();
                            const hasOffer = studentOffers[sessionIdStr] || studentOffers[session._id];
                            console.log(`Session ${sessionIdStr}: hasOffer =`, !!hasOffer);
                            console.log(`Available offers:`, Object.keys(studentOffers));

                            return hasOffer ? (
                                <StudentScreen offerData={hasOffer} socket={socket} />
                            ) : (
                                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300">
                                    Waiting for screen share...
                                </div>
                            );
                        })()}

                        <div className="flex gap-2 mt-2">
                            {session.isLocked ? (
                                <button
                                    onClick={() => handleUnlock(session._id)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700"
                                >
                                    <Unlock size={14} /> Unlock
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleLock(session._id)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700"
                                >
                                    <Lock size={14} /> Lock
                                </button>
                            )}
                            {/* ... existing buttons ... */}
                            {session.violationCount >= 3 && (
                                <button
                                    onClick={() => handleForceSubmit(session._id)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                                >
                                    <XCircle size={14} /> Submit
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedSession(session)}
                                className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200"
                            >
                                <Eye size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <TeacherLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <button
                        onClick={() => navigate('/teacher/tests')}
                        className="mb-4 text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2"
                    >
                        ? Back to Tests
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">{exam?.title}</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {exam?.classLevel} • Real-time Monitoring
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-3xl font-black text-indigo-600">{activeSessions.length}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Active</div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-gray-600">{notStartedStudents.length}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Not Started</div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-green-600">{completedSessions.length}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Completed</div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Filters */}
                    <div className="flex items-center gap-2 mt-6">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            All ({sessions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Active ({activeSessions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('not_started')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'not_started' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Not Started ({notStartedStudents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Completed ({completedSessions.length})
                        </button>
                    </div>
                </div>

                {/* Students Grid */}
                {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredData.map(renderStudentCard)}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Students</h3>
                        <p className="text-gray-600">No students in this category</p>
                    </div>
                )}

                {/* Session Detail Modal */}
                {selectedSession && selectedSession.hasStarted && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{selectedSession.student.name}</h2>
                                    <p className="text-gray-600">{selectedSession.student.classLevel} • {selectedSession.student.username}</p>
                                </div>
                                <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="text-sm text-gray-600 mb-1">Status</div>
                                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedSession.status)}`}>
                                            {selectedSession.status}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="text-sm text-gray-600 mb-1">Progress</div>
                                        <div className="text-2xl font-black text-gray-900">
                                            {selectedSession.answers}/{selectedSession.totalQuestions}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="text-sm font-bold text-gray-700 mb-3">Violations ({selectedSession.violationCount})</div>
                                    {selectedSession.violations && selectedSession.violations.length > 0 ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {selectedSession.violations.map((violation, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg">
                                                    <span className="font-semibold text-red-600">{violation.type.replace(/_/g, ' ')}</span>
                                                    <span className="text-gray-500">{new Date(violation.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">No violations recorded</div>
                                    )}
                                </div>

                                {selectedSession.lockReason && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <div className="text-sm font-bold text-red-700 mb-1">Lock Reason</div>
                                        <div className="text-sm text-red-600">{selectedSession.lockReason}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
};

export default ExamMonitor;

