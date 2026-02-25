import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import TeacherLayout from '../components/TeacherLayout';
import { 
    Clock, UserCheck, LogIn, LogOut, Calendar, Search, 
    ShieldCheck, Users, Zap, Briefcase, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffAttendance = () => {
    const { token, user } = useSelector((state) => state.auth);
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const fetchStaffAttendance = async () => {
        try {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const res = await axios.get(`http://localhost:2000/school/staff/attendance?date=${dateStr}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaffData(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching staff attendance:", error);
            toast.error("Failed to load staff records");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchStaffAttendance();
    }, [token, currentDate]);

    const handleTimeIn = async () => {
        if (isWeekend(new Date())) {
            return toast.error("Attendance can only be marked on weekdays.");
        }
        setMarking(true);
        try {
            await axios.post('http://localhost:2000/school/staff/time-in', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Time In marked successfully!");
            fetchStaffAttendance();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to mark Time In");
        } finally {
            setMarking(false);
        }
    };

    const handleTimeOut = async () => {
        setMarking(true);
        try {
            await axios.post('http://localhost:2000/school/staff/time-out', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Time Out marked successfully!");
            fetchStaffAttendance();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to mark Time Out");
        } finally {
            setMarking(false);
        }
    };

    const filteredStaff = staffData.filter(member =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentUserRecord = staffData.find(s => s.teacherId?.toString() === user?._id?.toString());

    return (
        <TeacherLayout>
            <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative">
                    <div className="absolute -top-24 -left-20 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-4">
                            <Activity size={12} className="text-emerald-400" />
                            <span className="text-emerald-300 text-[10px] font-black uppercase tracking-widest">Team Sync Active</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tight uppercase">
                            Staff <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent italic tracking-tighter">Continuum</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium italic">Real-time engagement tracking for all academic faculty.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleTimeIn}
                            disabled={marking || currentUserRecord?.timeIn !== '-' || isWeekend(new Date())}
                            className={`group flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden ${
                                currentUserRecord?.timeIn !== '-' 
                                ? 'bg-slate-900/40 text-slate-600 border border-white/5 cursor-not-allowed' 
                                : 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-0.5 active:scale-95'
                            }`}
                        >
                            <LogIn size={14} className={currentUserRecord?.timeIn !== '-' ? 'opacity-20' : ''} />
                            Log Entrance
                        </button>
                        <button
                            onClick={handleTimeOut}
                            disabled={marking || currentUserRecord?.timeIn === '-' || currentUserRecord?.timeOut !== '-'}
                            className={`group flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden ${
                                currentUserRecord?.timeIn === '-' || currentUserRecord?.timeOut !== '-' 
                                ? 'bg-slate-900/40 text-slate-600 border border-white/5 cursor-not-allowed' 
                                : 'bg-rose-600 text-white shadow-xl shadow-rose-600/20 hover:bg-rose-500 hover:-translate-y-0.5 active:scale-95'
                            }`}
                        >
                            <LogOut size={14} className={currentUserRecord?.timeIn === '-' || currentUserRecord?.timeOut !== '-' ? 'opacity-20' : ''} />
                            Log Exit
                        </button>
                    </div>
                </div>

                {/* Search & Date Module */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find colleague in the registry..."
                            className="w-full pl-14 pr-6 py-4.5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 text-slate-200 font-bold transition-all placeholder:text-slate-700 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex items-center justify-center gap-4 shadow-inner">
                        <Calendar size={18} className="text-emerald-400" />
                        <span className="text-xs font-black text-white uppercase tracking-[0.2em] italic">
                            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Staff Registry Ledger */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/2 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                                <tr>
                                    <th className="px-8 py-6">Reference</th>
                                    <th className="px-8 py-6">Faculty Member</th>
                                    <th className="px-8 py-6 text-center">Arrival Node</th>
                                    <th className="px-8 py-6 text-center">Departure Node</th>
                                    <th className="px-8 py-6 text-center">Stint Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-24 text-slate-600 font-black uppercase tracking-[0.3em] animate-pulse italic">Scanning Frequency...</td></tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-24 text-slate-700 font-bold italic">No active signatures detected for this cycle.</td></tr>
                                ) : (
                                    filteredStaff.map((staff, index) => (
                                        <tr key={staff.teacherId} className={`hover:bg-white/2 transition-all group ${staff.teacherId?.toString() === user?._id?.toString() ? 'bg-emerald-500/[0.03]' : ''}`}>
                                            <td className="px-8 py-6 text-[10px] font-black text-slate-700 uppercase tracking-widest italic group-hover:text-emerald-500/50 transition-colors">
                                                [{String(index + 1).padStart(3, '0')}]
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-center text-emerald-400 font-black text-xs italic shadow-inner group-hover:border-emerald-500/20 transition-all">
                                                        {staff.fullName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-white uppercase italic text-sm tracking-tight group-hover:text-emerald-400 transition-colors">{staff.fullName}</span>
                                                        {staff.teacherId?.toString() === user?._id?.toString() && (
                                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1 italic animate-pulse">Session Active</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className={`inline-flex items-center px-4 py-1.5 rounded-lg font-mono font-black text-xs border transition-all ${
                                                    staff.timeIn !== '-' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-900/10' 
                                                    : 'text-slate-800 border-transparent'
                                                }`}>
                                                    {staff.timeIn !== '-' ? staff.timeIn : 'OFFLINE'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className={`inline-flex items-center px-4 py-1.5 rounded-lg font-mono font-black text-xs border transition-all ${
                                                    staff.timeOut !== '-' 
                                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-lg shadow-rose-900/10' 
                                                    : 'text-slate-800 border-transparent'
                                                }`}>
                                                    {staff.timeOut !== '-' ? staff.timeOut : 'PENDING'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                    staff.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    staff.status === 'Late' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}>
                                                    {staff.status}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats Ledger Footer */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'On-Site Faculty', value: staffData.filter(s => s.status === 'Present' || s.status === 'Late').length, icon: Users, color: 'emerald' },
                        { label: 'Tardy Signatures', value: staffData.filter(s => s.status === 'Late').length, icon: Clock, color: 'amber' },
                        { label: 'Non-Responsive', value: staffData.filter(s => s.status === 'Absent').length, icon: ShieldCheck, color: 'rose' },
                        { label: 'Total Registry', value: staffData.length, icon: Briefcase, color: 'indigo' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-inner group hover:border-emerald-500/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <stat.icon size={16} className={`text-${stat.color}-400 opacity-50`} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </TeacherLayout>
    );
};

export default StaffAttendance;

