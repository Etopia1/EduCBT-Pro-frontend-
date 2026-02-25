import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        q: 'Is EduCBT Pro suitable for Nigerian secondary schools (JSS & SSS)?',
        a: "Absolutely. EduCBT Pro is built specifically for the Nigerian secondary school curriculum — covering JSS 1–3 and SSS 1–3 subjects, with question structures aligned to WAEC and NECO formats including objectives, theory, and practicals.",
    },
    {
        q: 'How does the AI proctoring work?',
        a: "When a student starts an exam, the system uses their device's camera to detect their face continuously. If the student looks away, switches tabs, or their face disappears from the frame, an alert is immediately sent to the supervising teacher's dashboard.",
    },
    {
        q: 'Do students need to install any app?',
        a: "No app download required! EduCBT Pro runs entirely in the browser on any device — desktops, laptops, Android phones, or tablets. Students just log in with their school credentials and start their exam.",
    },
    {
        q: 'How quickly are results available after an exam?',
        a: "Objective questions (MCQ) are graded instantly the moment a student submits. Teachers can view class-wide performance analytics within seconds of the last student finishing.",
    },
    {
        q: 'Can I import existing questions from Word or PDF?',
        a: "Yes. Our Smart Exam Builder supports question import from structured Word documents and CSV files. You can also create a reusable question bank and pull randomized questions per student to reduce copying.",
    },
    {
        q: 'What internet speed is required for students to take exams?',
        a: "EduCBT Pro is optimised for low-bandwidth environments. A stable 1Mbps connection is sufficient. For schools with unreliable internet, we offer an offline-cache mode that syncs automatically when connectivity returns.",
    },
    {
        q: 'Can I customise the platform with my school name and logo?',
        a: "Yes — all paid plans include custom school branding. Your school's name, logo, and colours will appear across student dashboards, exam covers, and PDF result reports.",
    },
];

export default function FAQ() {
    const [open, setOpen] = useState(null);

    return (
        <section id="faq" className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <span className="inline-block text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">
                        Got Questions?
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Everything you need to know about EduCBT Pro for your school.
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map(({ q, a }, i) => (
                        <div
                            key={i}
                            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                open === i
                                    ? 'border-indigo-500/50 bg-indigo-500/5'
                                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/70'
                            }`}
                        >
                            <button
                                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                                onClick={() => setOpen(open === i ? null : i)}
                            >
                                <span className="text-white font-semibold text-base">{q}</span>
                                <ChevronDown
                                    size={20}
                                    className={`text-indigo-400 shrink-0 transition-transform duration-300 ${
                                        open === i ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {open === i && (
                                <div className="px-6 pb-5">
                                    <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
