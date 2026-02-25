import { useNavigate } from 'react-router-dom';
import { ArrowRight, PhoneCall } from 'lucide-react';

export default function CallToAction() {
    const navigate = useNavigate();
    return (
        <section className="py-24 bg-slate-900 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
                    <PhoneCall size={14} className="text-indigo-400" />
                    <span className="text-indigo-300 text-sm font-medium">Ready to Get Started?</span>
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                    Transform How Your{' '}
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        School Conducts Exams
                    </span>
                </h2>

                <p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join hundreds of Nigerian secondary schools already running secure, stress-free 
                    CBT exams with EduCBT Pro. Setup takes less than 10 minutes.
                </p>

                {/* Student image strip */}
                <div className="flex justify-center -space-x-3 mb-8">
                    {[
                        'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=80&q=80',
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
                        'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=80&q=80',
                        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80',
                        'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=80&q=80',
                    ].map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt="student"
                            className="w-10 h-10 rounded-full border-2 border-slate-800 object-cover"
                        />
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        +2k
                    </div>
                </div>
                <p className="text-slate-400 text-sm mb-10">Trusted by 2,000+ students across Nigeria</p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/register-school')}
                        className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-10 py-4 rounded-full shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 text-base"
                    >
                        Register Your School Free
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-slate-300 hover:text-white font-medium px-8 py-4 rounded-full border border-slate-700 hover:border-slate-500 transition-all duration-300 text-base"
                    >
                        Already have an account? Log In
                    </button>
                </div>
            </div>
        </section>
    );
}
