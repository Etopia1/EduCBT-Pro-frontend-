import { ClipboardList, UploadCloud, PlayCircle, BarChart2 } from 'lucide-react';

const steps = [
    {
        icon: ClipboardList,
        step: '01',
        title: 'Register Your School',
        desc: 'Sign up in under 5 minutes. Add your school name, set up classes (JSS1 – SSS3), and invite teachers using a unique link.',
        color: 'from-indigo-500 to-indigo-600',
        img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=80',
        imgAlt: 'Teacher setting up school on laptop',
    },
    {
        icon: UploadCloud,
        step: '02',
        title: 'Build & Upload Exams',
        desc: 'Create questions from scratch or import from Word/CSV. Set time limits, randomize questions, and assign to specific classes.',
        color: 'from-purple-500 to-purple-600',
        img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&q=80',
        imgAlt: 'Teacher uploading exam questions',
    },
    {
        icon: PlayCircle,
        step: '03',
        title: 'Students Take the Exam',
        desc: 'Students log in on any device — phone, tablet, or PC. The AI proctor monitors them automatically throughout. No special skills needed.',
        color: 'from-pink-500 to-rose-500',
        img: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=500&q=80',
        imgAlt: 'Student taking CBT exam on a laptop',
    },
    {
        icon: BarChart2,
        step: '04',
        title: 'Get Instant Results & Analytics',
        desc: 'The moment a student submits, their score appears. Teachers get full class analytics, subject breakdowns, and downloadable PDF reports.',
        color: 'from-amber-500 to-orange-500',
        img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80',
        imgAlt: 'Teacher reviewing analytics dashboard',
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
                        Simple Setup
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Up and Running in{' '}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            4 Easy Steps
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        No IT department needed. Any teacher can set up a CBT exam in minutes.
                    </p>
                </div>

                <div className="space-y-12">
                    {steps.map(({ icon: Icon, step, title, desc, color, img, imgAlt }, idx) => (
                        <div
                            key={step}
                            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                        >
                            {/* Text side */}
                            <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shrink-0`}>
                                        <Icon size={22} className="text-white" />
                                    </div>
                                    <span className={`text-5xl font-extrabold bg-gradient-to-br ${color} bg-clip-text text-transparent opacity-30`}>
                                        {step}
                                    </span>
                                </div>
                                <h3 className="text-white text-2xl font-bold mb-3">{title}</h3>
                                <p className="text-slate-400 text-base leading-relaxed">{desc}</p>
                            </div>

                            {/* Image side */}
                            <div className={`relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/40 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                                <img
                                    src={img}
                                    alt={imgAlt}
                                    className="w-full h-64 object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/20 to-transparent" />
                                <div className={`absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg text-white text-xs font-bold`}>
                                    {step}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
