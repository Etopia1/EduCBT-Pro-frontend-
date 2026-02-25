import { GraduationCap, Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Github } from 'lucide-react';

const links = {
    Product: ['Features', 'How It Works', 'Pricing', 'Changelog', 'Roadmap'],
    Company: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Privacy Policy'],
    Support: ['Help Center', 'Contact Us', 'Status Page', 'Terms of Service', 'API Docs'],
};

const socials = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Github, href: '#', label: 'GitHub' },
];

export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <GraduationCap size={20} className="text-white" />
                            </div>
                            <span className="text-white font-bold text-lg tracking-tight">
                                EduCBT <span className="text-indigo-400">Pro</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
                            The most intelligent Computer-Based Testing platform for Nigerian schools. Secure, fast, and built for the future of education.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Mail size={14} className="text-indigo-400" />
                                <span>support@educbtpro.ng</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Phone size={14} className="text-indigo-400" />
                                <span>+234 800 000 0000</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <MapPin size={14} className="text-indigo-400" />
                                <span>Lagos, Nigeria</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    {Object.entries(links).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
                            <ul className="space-y-2.5">
                                {items.map((item) => (
                                    <li key={item}>
                                        <a
                                            href="#"
                                            className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                                        >
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} EduCBT Pro. All rights reserved.
                    </p>
                    <div className="flex items-center gap-3">
                        {socials.map(({ icon: Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                            >
                                <Icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
