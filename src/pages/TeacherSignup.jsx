import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { BookOpen, MapPin, User, Mail, Lock, Plus, X, Phone, Building2, ArrowRight, CheckCircle, GraduationCap, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherSignup = () => {
    const [searchParams] = useSearchParams();
    const { token } = useParams(); // Using 'token' param effectively as 'schoolRefId' context or invite
    // NOTE: If token is long (JWT/Invite), it's treated as invite. If short/format (REF-...), we treat as school link.

    const navigate = useNavigate();

    // Fallback if they use the old ?schoolId query param
    const urlSchoolId = searchParams.get('schoolId');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        schoolId: urlSchoolId || '',
        location: '',
        phone: '',
        gender: '',
        dateOfBirth: '',
        inviteCode: '' // Manual token entry
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [subjects, setSubjects] = useState(['']);
    const [schools, setSchools] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // State for School Info & Validation
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [isCheckingInfo, setIsCheckingInfo] = useState(!!token);

    useEffect(() => {
        // Fetch list of schools for dropdown selection (only if no token/id specific)
        const fetchSchools = async () => {
            try {
                const res = await axios.get('https://educbt-pro-backend.onrender.com/school/list');
                setSchools(res.data);
            } catch (error) {
                console.error("Failed to fetch schools");
            }
        };

        if (!token && !urlSchoolId) fetchSchools();

        // Handle URL Parameter (Could be Invite Token OR School Ref ID)
        if (token) {
            const verifyOrFetch = async () => {
                setIsCheckingInfo(true);
                try {
                    // Try as Invite Token first
                    // Note: If it's a Ref ID (REF-...), invite-info might fail or we should detect format?
                    // Let's try invite-info endpoint which now supports schoolRefId fallback or we create new endpoint?
                    // Actually, let's try `invite-info` first.
                    try {
                        const res = await axios.get(`https://educbt-pro-backend.onrender.com/school/invite-info/${token}`);
                        setSchoolInfo(res.data.school);
                        setFormData(prev => ({
                            ...prev,
                            schoolId: res.data.school._id,
                            inviteCode: token, // It is an invite token
                            email: res.data.email || prev.email
                        }));
                    } catch (err) {
                        // If invite-info fails, try as School Ref ID
                        try {
                            const resRef = await axios.get(`https://educbt-pro-backend.onrender.com/school/ref-info/${token}`);
                            setSchoolInfo(resRef.data);
                            setFormData(prev => ({
                                ...prev,
                                schoolId: resRef.data._id,
                                // It is NOT an invite token, just a school link
                            }));
                        } catch (err2) {
                            console.error("Link invalid");
                            toast.error("Invalid School Link or Invite");
                        }
                    }
                } finally {
                    setIsCheckingInfo(false);
                }
            };
            verifyOrFetch();
        }
        else if (urlSchoolId) {
            const fetchSchoolInfo = async () => {
                try {
                    const res = await axios.get(`https://educbt-pro-backend.onrender.com/school/public/${urlSchoolId}`);
                    setSchoolInfo(res.data);
                    setFormData(prev => ({ ...prev, schoolId: res.data._id }));
                } catch (error) {
                    console.error("Failed to fetch school info");
                }
            };
            fetchSchoolInfo();
        }
    }, [token, urlSchoolId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubjectChange = (index, value) => {
        const newSubjects = [...subjects];
        newSubjects[index] = value;
        setSubjects(newSubjects);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const addSubjectField = () => {
        setSubjects([...subjects, '']);
    };

    const removeSubjectField = (index) => {
        const newSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(newSubjects);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setIsLoading(false);
            return;
        }

        const validSubjects = subjects.filter(s => s.trim() !== '');
        if (validSubjects.length === 0) {
            toast.error("Please add at least one subject.");
            setIsLoading(false);
            return;
        }

        try {
            // Create FormData to send file
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            data.append('subjects', JSON.stringify(validSubjects));
            if (profilePicture) {
                data.append('profilePicture', profilePicture);
            }

            await axios.post('https://educbt-pro-backend.onrender.com/school/signup/teacher', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Registration successful! Please login.");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* LEFT SIDE: Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden items-center justify-center">
                {/* Dynamic Background */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
                <div className="absolute inset-0 bg-linear-to-br from-indigo-900/90 to-purple-900/90"></div>

                {/* Animated Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -top-10 -left-10"></div>
                    <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-1/2 left-1/2 animation-delay-2000"></div>
                    <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -bottom-10 -right-10 animation-delay-4000"></div>
                </div>

                <div className="relative z-10 p-12 text-center text-white max-w-lg">
                    {schoolInfo ? (
                        <>
                            {schoolInfo.logoUrl && (
                                <div className="mx-auto bg-white/10 backdrop-blur-md p-2 rounded-full mb-8 inline-flex items-center justify-center w-48 h-48 shadow-2xl border border-white/20 overflow-hidden">
                                    <img
                                        src={schoolInfo.logoUrl}
                                        alt={schoolInfo.name}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            )}
                            <h2 className="text-4xl font-extrabold tracking-tight mb-4">{schoolInfo.name}</h2>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-indigo-100 font-medium">
                                <GraduationCap size={18} />
                                <span className="uppercase tracking-wide">Teacher Application</span>
                            </div>
                            <p className="mt-6 text-lg text-indigo-200 leading-relaxed">
                                Join our academic staff. Please provide your details and registration code.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="mb-8 inline-flex p-8 rounded-full bg-white/10 backdrop-blur-md">
                                <Building2 size={64} className="text-indigo-200" />
                            </div>
                            <h2 className="text-4xl font-bold mb-4">Teacher Portal</h2>
                            <p className="text-indigo-200 text-lg">
                                Register to manage classes and assessments.
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className="flex-1 overflow-y-auto h-screen bg-gray-50/50">
                <div className="flex min-h-full flex-col justify-center py-10 px-4 sm:px-6 lg:px-20 xl:px-24">
                    <div className="max-w-lg w-full mx-auto bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100">

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Create Account</h3>
                            <p className="text-gray-500 text-xs">Faculty Registration Form</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Profile Picture Upload */}
                            <div className="flex justify-center pb-2">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-indigo-300 flex items-center justify-center overflow-hidden">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={28} className="text-gray-400" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-md">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </label>
                                </div>
                            </div>

                            {/* Reg Number & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Phone Only Row for layout balance if Reg Num removed? Or full width? */}
                                <div className="space-y-1 md:col-span-2">
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="tel" name="phone" required
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm"
                                            placeholder="Phone Number"
                                            value={formData.phone} onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Gender & DOB Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Gender</label>
                                    <div className="relative">
                                        <select
                                            name="gender" required
                                            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm appearance-none cursor-pointer"
                                            value={formData.gender || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Date of Birth</label>
                                    <input
                                        type="date" name="dateOfBirth" required
                                        className="w-full pl-3 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm"
                                        value={formData.dateOfBirth || ''} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Name & Email Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="text" name="fullName" required
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm"
                                            placeholder="Name"
                                            value={formData.fullName} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="email" name="email" required
                                            className={`w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm ${formData.inviteCode ? 'opacity-70' : ''}`}
                                            placeholder="Email"
                                            value={formData.email} onChange={handleChange}
                                            readOnly={!!formData.inviteCode}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location & Class Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Location</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="text" name="location" required
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm"
                                            placeholder="City"
                                            value={formData.location} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Class</label>
                                    <div className="relative">
                                        <select
                                            name="classLevel"
                                            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm appearance-none cursor-pointer"
                                            value={formData.classLevel || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select...</option>
                                            <option value="JSS 1">JSS 1</option>
                                            <option value="JSS 2">JSS 2</option>
                                            <option value="JSS 3">JSS 3</option>
                                            <option value="SS 1">SS 1</option>
                                            <option value="SS 2">SS 2</option>
                                            <option value="SS 3">SS 3</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* School Selection - Hidden if Info is Loaded */}
                            {!schoolInfo && (
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">School</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <select
                                            name="schoolId"
                                            value={formData.schoolId}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select School...</option>
                                            {schools.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Subjects */}
                            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 mt-2">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                                        <BookOpen size={14} className="text-indigo-600" /> Subjects
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addSubjectField}
                                        className="text-[10px] font-bold bg-white border border-indigo-200 text-indigo-600 px-2 py-1 rounded-md shadow-xs hover:bg-indigo-50 transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
                                    {subjects.map((subject, index) => (
                                        <div key={index} className="flex gap-1">
                                            <input
                                                type="text"
                                                className="flex-1 min-w-0 px-2 py-1 bg-white border border-indigo-200 rounded-md text-xs"
                                                placeholder={`Sub ${index + 1}`}
                                                value={subject}
                                                onChange={(e) => handleSubjectChange(index, e.target.value)}
                                                required
                                            />
                                            {subjects.length > 1 && (
                                                <button type="button" onClick={() => removeSubjectField(index)} className="text-rose-500"><X size={12} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Password Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="password" name="password" required
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm"
                                            placeholder="••••••"
                                            value={formData.password} onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="password" name="confirmPassword" required
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-gray-800 font-medium text-sm"
                                            placeholder="••••••"
                                            value={formData.confirmPassword} onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] transform transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span className="text-sm">Registering...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm">Submit Application</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-600 font-medium mt-4">
                                Already have an account? <a href="/#/login" className="text-indigo-600 hover:text-indigo-700 hover:underline">Sign in</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TeacherSignup;

