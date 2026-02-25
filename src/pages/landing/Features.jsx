import {
    ClipboardList,
    Eye,
    BarChart2,
    Clock,
    ShieldCheck,
    Users,
    FileText,
    Smartphone,
} from 'lucide-react';

const features = [
    {
        icon: ClipboardList,
        title: 'Smart Exam Builder',
        desc: 'Create MCQ, theory, and mixed-format exams with timed sections, question banks, and randomization.',
        color: 'from-indigo-500 to-indigo-600',
        bg: 'from-indigo-500/10 to-indigo-600/5',
        border: 'border-indigo-500/20',
    },
    {
        icon: Eye,
        title: 'AI-Powered Proctoring',
        desc: 'Real-time face detection, eye tracking, and tab-switch monitoring ensure exam integrity automatically.',
        color: 'from-purple-500 to-purple-600',
        bg: 'from-purple-500/10 to-purple-600/5',
        border: 'border-purple-500/20',
    },
    {
        icon: BarChart2,
        title: 'Deep Analytics',
        desc: "Detailed per-student and per-class reports give teachers instant insight into performance trends.",
        color: 'from-pink-500 to-pink-600',
        bg: 'from-pink-500/10 to-pink-600/5',
        border: 'border-pink-500/20',
    },
    {
        icon: Clock,
        title: 'Instant Auto-Grading',
        desc: 'Objective questions are graded the moment students submit, with results available immediately.',
        color: 'from-amber-500 to-orange-500',
        bg: 'from-amber-500/10 to-orange-500/5',
        border: 'border-amber-500/20',
    },
    {
        icon: ShieldCheck,
        title: 'Violation Alerts',
        desc: 'Teachers receive live alerts the moment suspicious activity is detected during an ongoing exam.',
        color: 'from-emerald-500 to-teal-500',
        bg: 'from-emerald-500/10 to-teal-500/5',
        border: 'border-emerald-500/20',
    },
    {
        icon: Users,
        title: 'Multi-Role Management',
        desc: 'Separate portals for admins, teachers, and students with fine-grained access controls.',
        color: 'from-cyan-500 to-sky-500',
        bg: 'from-cyan-500/10 to-sky-500/5',
        border: 'border-cyan-500/20',
    },
    {
        icon: FileText,
        title: 'PDF Report Export',
        desc: 'Generate and download professional exam result reports and receipts in one click.',
        color: 'from-violet-500 to-fuchsia-500',
        bg: 'from-violet-500/10 to-fuchsia-500/5',
        border: 'border-violet-500/20',
    },
    {
        icon: Smartphone,
        title: 'Mobile Friendly',
        desc: 'Students can take exams on any device — desktops, tablets, or phones — no app download needed.',
        color: 'from-rose-500 to-pink-500',
        bg: 'from-rose-500/10 to-pink-500/5',
        border: 'border-rose-500/20',
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">
                        Platform Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Everything Your School Needs
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        From exam creation to result analysis — EduCBT Pro handles the full lifecycle of
                        computer-based testing with intelligence and ease.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
                        <div
                            key={title}
                            className={`group relative bg-gradient-to-br ${bg} border ${border} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-default`}
                        >
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                            >
                                <Icon size={22} className="text-white" />
                            </div>
                            <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
