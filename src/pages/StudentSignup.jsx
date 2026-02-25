import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { User, MapPin, Hash, Book, Lock, Building2, ArrowRight, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentSignup = () => {
    const [searchParams] = useSearchParams();
    const { schoolRefId } = useParams(); // Get Gibberish/Ref Code
    const navigate = useNavigate();

    // Legacy support
    const urlSchoolId = searchParams.get('schoolId');

    const [formData, setFormData] = useState({
        fullName: '',
        classLevel: '',
        location: '',
        dateOfBirth: '',
        phone: '',
        gender: '',
        password: '',
        confirmPassword: '',
        schoolId: urlSchoolId || ''
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [schools, setSchools] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [isCheckingRef, setIsCheckingRef] = useState(!!schoolRefId);
    const [successData, setSuccessData] = useState(null); // To store generated IDs

    useEffect(() => {
        // Fetch list of schools only if not using a specific link
        if (!schoolRefId && !urlSchoolId) {
            const fetchSchools = async () => {
                try {
                    const res = await axios.get('https://educbt-pro-backend.onrender.com/school/list');
                    setSchools(res.data);
                } catch (error) {
                    console.error("Failed to fetch schools");
                }
            };
            fetchSchools();
        }

        // 1. Handle Ref ID Link (The "Gibberish" Public Link)
        if (schoolRefId) {
            const verifyRef = async () => {
                setIsCheckingRef(true);
                try {
                    const res = await axios.get(`https://educbt-pro-backend.onrender.com/school/ref-info/${schoolRefId}`);
                    setSchoolInfo(res.data);
                    setFormData(prev => ({ ...prev, schoolId: res.data._id }));
                } catch (error) {
                    console.error(error);
                    toast.error("Invalid School Link");
                } finally {
                    setIsCheckingRef(false);
                }
            };
            verifyRef();
        }
        // 2. Handle Legacy Query Param
        else if (urlSchoolId) {
            const fetchSchoolInfo = async () => {
                try {
                    const res = await axios.get(`https://educbt-pro-backend.onrender.com/school/public/${urlSchoolId}`);
                    setSchoolInfo(res.data);
                } catch (error) {
                    console.error("Failed to fetch school info");
                }
            };
            fetchSchoolInfo();
        }
    }, [schoolRefId, urlSchoolId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            // Create FormData to send file
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (profilePicture) {
                data.append('profilePicture', profilePicture);
            }

            const res = await axios.post('https://educbt-pro-backend.onrender.com/school/signup/student', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Registration successful!");
            setSuccessData(res.data); // Save response to show modal
            // navigate('/login'); // Don't navigate yet, let them see the ID
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
            setIsLoading(false);
        }
    };

    if (isCheckingRef) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (successData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <GraduationCap size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600 mb-6">Your specific IDs have been generated. Please keep them safe.</p>

                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6 border border-gray-200">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Your Login ID</p>
                            <p className="font-mono text-lg font-bold text-emerald-700">{successData.uniqueLoginId}</p>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                            <p className="text-xs font-bold text-gray-500 uppercase">Registration Number</p>
                            <p className="font-mono text-lg font-bold text-gray-800">{successData.registrationNumber}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        Proceed to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* LEFT SIDE: Branding Panel (Fixed) */}
            <div className="hidden lg:flex lg:w-[45%] relative bg-[#064e3b] overflow-hidden items-center justify-center">
                {/* Background Patterns */}
                <div className="absolute inset-0 bg-linear-to-bl from-emerald-600/20 to-teal-900/40"></div>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                {/* Ambient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-overlay filter blur-[100px] opacity-40 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-400 rounded-full mix-blend-overlay filter blur-[100px] opacity-40 animate-pulse-slow delay-1000"></div>

                <div className="relative z-10 px-12 text-center text-white max-w-md">
                    {schoolInfo ? (
                        <>
                            <div className="mb-8 relative inline-block group">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                <div className="relative w-32 h-32 mx-auto bg-white rounded-full p-1 shadow-2xl ring-4 ring-white/10 backdrop-blur-xs">
                                    <img
                                        src={schoolInfo.logoUrl || "https://via.placeholder.com/150"}
                                        alt={schoolInfo.name}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            </div>
                            <h2 className="text-4xl font-black tracking-tight mb-4 drop-shadow-lg">{schoolInfo.name}</h2>
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-50 text-sm font-semibold mb-8">
                                <GraduationCap size={18} />
                                <span>Student Portal</span>
                            </div>
                        </>
                    ) : (
                        <div className="mb-8">
                            <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 inline-block mb-6 shadow-2xl">
                                <GraduationCap size={64} className="text-emerald-300" />
                            </div>
                            <h2 className="text-4xl font-black mb-4 tracking-tight">Student Access</h2>
                        </div>
                    )}
                    <p className="text-lg text-emerald-100/90 leading-relaxed font-medium">
                        Join your school's digital ecosystem. Take CBT exams, check results, and manage your academic profile seamlessly.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 overflow-y-auto h-screen relative">
                {/* Mobile Background Decoration */}
                <div className="lg:hidden absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                </div>

                <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 relative z-10">

                    {/* Header Text */}
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Student Account</h3>
                        <p className="text-gray-500 text-sm">Enter your personal details to register.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Profile Picture Upload */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-emerald-300 flex items-center justify-center overflow-hidden">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={36} className="text-gray-400" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </label>
                            </div>
                        </div>

                        {/* Personal Details Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="text" name="fullName" required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 text-sm placeholder-gray-400"
                                        placeholder="e.g. Michael Smith"
                                        value={formData.fullName} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Registration Number Field Removed - Auto Generated */}


                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Date of Birth</label>
                                <div className="relative">
                                    <input
                                        type="date" name="dateOfBirth" required
                                        className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 text-sm"
                                        value={formData.dateOfBirth} onChange={handleChange}
                                    />
                                    {formData.dateOfBirth && (
                                        <div className="absolute right-3 top-3.5 text-xs font-bold text-emerald-600">
                                            {new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()} Years
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Gender</label>
                                <div className="relative">
                                    <select
                                        name="gender" required
                                        className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 text-sm appearance-none cursor-pointer"
                                        value={formData.gender} onChange={handleChange}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Class */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Phone Number</label>
                            <input
                                type="tel" name="phone" required
                                className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 text-sm placeholder-gray-400"
                                placeholder="+234..."
                                value={formData.phone} onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">City / Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="text" name="location" required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 text-sm placeholder-gray-400"
                                        placeholder="City"
                                        value={formData.location} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Class Level</label>
                                <div className="relative">
                                    <Book className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                    <select
                                        name="classLevel" required
                                        className="w-full pl-10 pr-8 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 text-sm appearance-none cursor-pointer"
                                        value={formData.classLevel} onChange={handleChange}
                                    >
                                        <option value="">Select Class</option>
                                        <option value="JSS 1">JSS 1</option>
                                        <option value="JSS 2">JSS 2</option>
                                        <option value="JSS 3">JSS 3</option>
                                        <option value="SS 1">SS 1</option>
                                        <option value="SS 2">SS 2</option>
                                        <option value="SS 3">SS 3</option>
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* School Select (if manual) */}
                        {!schoolInfo && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Select School</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                    <select
                                        name="schoolId" required
                                        value={formData.schoolId} onChange={handleChange}
                                        className="w-full pl-10 pr-8 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose your school...</option>
                                        {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="password" name="password" required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 text-sm placeholder-gray-400"
                                        placeholder="••••••••"
                                        value={formData.password} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="password" name="confirmPassword" required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 text-sm placeholder-gray-400"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Register Account</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-500 font-medium">
                            Already registered? <a href="/#/login" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">Log in here</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentSignup;

