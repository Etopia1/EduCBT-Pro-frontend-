import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    GraduationCap, ArrowLeft, Upload, School, Mail, Phone,
    MapPin, User, Lock, CheckCircle2, ArrowRight
} from 'lucide-react';

const steps = ['School Info', 'Location', 'Admin Account'];

const SchoolRegister = () => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        schoolName: '',
        schoolEmail: '',
        phone: '',
        address: '',
        location: { city: '', state: '', country: 'Nigeria' },
        adminName: '',
        adminPassword: '',
    });
    const [logo, setLogo] = useState(null);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setLogo(file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        if (logo) data.append('logo', logo);
        data.append('schoolName', formData.schoolName);
        data.append('schoolEmail', formData.schoolEmail);
        data.append('phone', formData.phone);
        data.append('address', formData.address);
        data.append('location', JSON.stringify(formData.location));
        data.append('adminName', formData.adminName);
        data.append('adminPassword', formData.adminPassword);

        const loadingToast = toast.loading('Registering school...');
        try {
            const res = await axios.post('https://educbt-pro-backend.onrender.com/school/register', data);
            toast.dismiss(loadingToast);
            toast.success('Registration successful! Check your email.', { duration: 6000 });
            toast((t) => (
                <span>
                    Your Login ID: <b>{res.data.schoolLoginId}</b>
                    <br />Please save this!
                </span>
            ), { duration: 8000, icon: '??' });
            navigate('/login');
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    // Input field shared styling
    const inputClass =
        'w-full bg-slate-900/70 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all duration-200';

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4 py-10">
            {/* Background glows */}
            <div
                className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(-30%, -30%)' }}
            />
            <div
                className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #a855f7, transparent)', transform: 'translate(30%, 30%)' }}
            />
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Back to home */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Home
            </button>

            <div className="relative z-10 w-full max-w-lg">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4">
                        <GraduationCap size={28} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-2xl tracking-tight">
                        EduCBT <span className="text-indigo-400">Pro</span>
                    </span>
                    <p className="text-slate-400 text-sm mt-1">Register your secondary school</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                        i < step
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                            : i === step
                                            ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400'
                                            : 'bg-slate-800 border border-slate-700 text-slate-500'
                                    }`}
                                >
                                    {i < step ? <CheckCircle2 size={14} /> : i + 1}
                                </div>
                                <span className={`text-xs mt-1 hidden sm:block ${i === step ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    {label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-10 h-px mb-5 transition-all duration-300 ${i < step ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form card */}
                <form onSubmit={step < 2 ? (e) => { e.preventDefault(); setStep(s => s + 1); } : handleSubmit}>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-8 shadow-2xl">

                        {/* Step 0: School Info */}
                        {step === 0 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">School Information</h2>
                                    <p className="text-slate-400 text-sm">Tell us about your secondary school</p>
                                </div>

                                {/* Logo upload */}
                                <div className="flex flex-col items-center">
                                    <label
                                        htmlFor="logo-upload"
                                        className="cursor-pointer group"
                                        title="Click to upload school logo"
                                    >
                                        <div className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${
                                            preview
                                                ? 'border-indigo-500/50'
                                                : 'border-slate-600 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-900'
                                        }`}>
                                            {preview ? (
                                                <img src={preview} alt="Logo preview" className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-slate-500 group-hover:text-indigo-400 transition-colors">
                                                    <Upload size={22} />
                                                    <span className="text-xs font-medium">Logo</span>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <p className="text-slate-500 text-xs mt-2">Click to upload school logo</p>
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">School Name *</label>
                                    <div className="relative">
                                        <School size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            name="schoolName"
                                            value={formData.schoolName}
                                            onChange={handleChange}
                                            placeholder="e.g. Greater Heights Secondary School"
                                            required
                                            className={inputClass + ' pl-10'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">School Email *</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            name="schoolEmail"
                                            type="email"
                                            value={formData.schoolEmail}
                                            onChange={handleChange}
                                            placeholder="school@example.com"
                                            required
                                            className={inputClass + ' pl-10'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+234 800 000 0000"
                                            className={inputClass + ' pl-10'}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Location */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">School Location</h2>
                                    <p className="text-slate-400 text-sm">Where is your school located?</p>
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">Street Address</label>
                                    <div className="relative">
                                        <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="12 School Street, GRA"
                                            className={inputClass + ' pl-10'}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2">City</label>
                                        <input
                                            name="location.city"
                                            value={formData.location.city}
                                            onChange={handleChange}
                                            placeholder="Lagos"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2">State</label>
                                        <input
                                            name="location.state"
                                            value={formData.location.state}
                                            onChange={handleChange}
                                            placeholder="Lagos State"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">Country</label>
                                    <input
                                        name="location.country"
                                        value={formData.location.country}
                                        onChange={handleChange}
                                        placeholder="Nigeria"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Admin Account */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">Admin Account</h2>
                                    <p className="text-slate-400 text-sm">Create your school administrator login</p>
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">Admin Full Name *</label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            name="adminName"
                                            value={formData.adminName}
                                            onChange={handleChange}
                                            placeholder="e.g. Mrs. Adaeze Okonkwo"
                                            required
                                            className={inputClass + ' pl-10'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">Admin Password *</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            name="adminPassword"
                                            type="password"
                                            value={formData.adminPassword}
                                            onChange={handleChange}
                                            placeholder="Create a strong password"
                                            required
                                            className={inputClass + ' pl-10'}
                                        />
                                    </div>
                                </div>

                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                                    <p className="text-indigo-300 text-xs leading-relaxed">
                                        ?? After registration, you'll receive a unique <strong>School Login ID</strong> (e.g. SCH-1234) by email. 
                                        Use it together with your password to log in.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className={`flex gap-3 mt-7 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
                            {step > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(s => s - 1)}
                                    className="flex items-center gap-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 text-slate-300 hover:text-white font-medium px-6 py-3 rounded-xl text-sm transition-all duration-200"
                                >
                                    <ArrowLeft size={15} />
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-7 py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 text-sm"
                            >
                                {step < 2 ? (
                                    <>Next <ArrowRight size={15} /></>
                                ) : (
                                    <>Complete Registration <CheckCircle2 size={15} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <p className="text-center text-slate-500 text-sm mt-5">
                    Already registered?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        Log in to your portal
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SchoolRegister;

