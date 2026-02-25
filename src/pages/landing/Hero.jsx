import { ArrowRight, ShieldCheck, Zap, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950"
        >
            {/* Animated gradient background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950" />
                <div
                    className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}
                />
                <div
                    className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}
                />
                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text */}
                    <div>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
                            <ShieldCheck size={14} className="text-indigo-400" />
                            <span className="text-indigo-300 text-sm font-medium">Nigeria's #1 Secondary School CBT Platform</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                            Smarter Exams for{' '}
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Secondary Schools
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
                            EduCBT Pro gives Nigerian secondary schools — from JSS1 to SSS3 — 
                            a powerful, fraud-proof CBT platform with AI proctoring, 
                            instant grading, and WAEC-aligned question formats.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
                            <button
                                onClick={() => navigate('/register-school')}
                                className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 text-base"
                            >
                                Register Your School Free
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 text-base backdrop-blur-sm"
                            >
                                Log In to School Portal
                            </button>
                        </div>

                        {/* Stat Pills */}
                        <div className="flex flex-wrap gap-3">
                            {[
                                { icon: Users, label: '500+ Schools', color: 'text-indigo-400' },
                                { icon: BookOpen, label: 'JSS1 – SSS3', color: 'text-purple-400' },
                                { icon: ShieldCheck, label: 'AI Proctoring', color: 'text-pink-400' },
                                { icon: Zap, label: 'Instant Results', color: 'text-amber-400' },
                            ].map(({ icon: Icon, label, color }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm"
                                >
                                    <Icon size={14} className={color} />
                                    <span className="text-slate-300 text-sm font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Student image + floating cards */}
                    <div className="relative hidden lg:block">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/40">
                            <img
                                src="https://images.unsplash.com/photo-1588072432836-e10032774350?w=700&q=85"
                                alt="Secondary school student using a laptop for CBT exam"
                                className="w-full h-[480px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                        </div>

                        {/* Floating live card — top left */}
                        <div className="absolute -top-4 -left-6 bg-slate-800/90 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                            <div>
                                <p className="text-white text-xs font-semibold">Exam Live</p>
                                <p className="text-slate-400 text-xs">SS2 Mathematics — 48 students</p>
                            </div>
                        </div>

                        {/* Floating result card — bottom right */}
                        <div className="absolute -bottom-4 -right-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-3 shadow-xl">
                            <p className="text-slate-400 text-xs mb-1">Aisha B. — Biology</p>
                            <p className="text-white text-2xl font-extrabold">92<span className="text-indigo-400 text-base">/100</span></p>
                            <p className="text-green-400 text-xs font-medium mt-0.5">✓ Result ready instantly</p>
                        </div>

                        {/* Glow */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-indigo-600/20 blur-2xl rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
