import { useState, useEffect } from 'react';
import { Menu, X, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navLinks = [
    { id: 'features', label: 'Features' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'testimonials', label: 'Reviews' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMenuOpen(false);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-slate-900/90 backdrop-blur-lg shadow-lg shadow-slate-900/30'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <GraduationCap size={20} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">
                            EduCBT <span className="text-indigo-400">Pro</span>
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-6">
                        {navLinks.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => scrollTo(id)}
                                className="text-slate-300 hover:text-white text-sm font-medium transition-colors duration-200"
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-4 py-2"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/register-school')}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-indigo-500/30 transition-all duration-200"
                        >
                            Get Started Free
                        </button>
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="lg:hidden text-white p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="lg:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 px-4 py-4 space-y-1">
                    {navLinks.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => scrollTo(id)}
                            className="block w-full text-left text-slate-300 hover:text-white text-sm font-medium py-2.5 transition-colors"
                        >
                            {label}
                        </button>
                    ))}
                    <div className="pt-3 border-t border-slate-700/50 flex flex-col gap-2">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-slate-300 hover:text-white text-sm font-medium text-left py-2 transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/register-school')}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full text-center"
                        >
                            Get Started Free
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
