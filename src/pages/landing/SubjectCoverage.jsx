const subjects = [
    { name: 'Mathematics', emoji: '📐', color: 'from-indigo-500 to-indigo-600' },
    { name: 'English Language', emoji: '📝', color: 'from-purple-500 to-purple-600' },
    { name: 'Biology', emoji: '🧬', color: 'from-emerald-500 to-teal-500' },
    { name: 'Physics', emoji: '⚡', color: 'from-amber-500 to-orange-500' },
    { name: 'Chemistry', emoji: '🧪', color: 'from-pink-500 to-rose-500' },
    { name: 'Geography', emoji: '🌍', color: 'from-sky-500 to-cyan-500' },
    { name: 'Economics', emoji: '📊', color: 'from-violet-500 to-fuchsia-500' },
    { name: 'Civic Education', emoji: '🏛️', color: 'from-teal-500 to-green-500' },
    { name: 'Agricultural Science', emoji: '🌾', color: 'from-lime-500 to-green-500' },
    { name: 'Computer Studies', emoji: '💻', color: 'from-slate-400 to-slate-600' },
    { name: 'Literature in English', emoji: '📚', color: 'from-orange-500 to-red-500' },
    { name: 'Christian Religious Studies', emoji: '✝️', color: 'from-yellow-500 to-amber-500' },
    { name: 'Islamic Religious Studies', emoji: '☪️', color: 'from-green-500 to-emerald-600' },
    { name: 'Government', emoji: '⚖️', color: 'from-indigo-500 to-sky-500' },
    { name: 'Further Mathematics', emoji: '🔢', color: 'from-red-500 to-pink-500' },
    { name: 'Technical Drawing', emoji: '📏', color: 'from-cyan-500 to-blue-500' },
];

export default function SubjectCoverage() {
    return (
        <section id="subjects" className="py-24 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.07),transparent_60%)]" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-14">
                    <span className="inline-block text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
                        Curriculum Aligned
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                        All{' '}
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            WAEC & NECO
                        </span>{' '}
                        Subjects Covered
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Set CBT exams for every subject in the Nigerian secondary school curriculum,
                        from JSS1 all the way to SSS3.
                    </p>
                </div>

                {/* Subject grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {subjects.map(({ name, emoji, color }) => (
                        <div
                            key={name}
                            className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 hover:border-slate-500/70 hover:bg-slate-800/80 transition-all duration-200 cursor-default group"
                        >
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0 text-lg group-hover:scale-110 transition-transform duration-200`}>
                                {emoji}
                            </div>
                            <span className="text-slate-300 text-sm font-medium leading-tight">{name}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-5 py-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-slate-400 text-sm">+ Custom subjects for any school department</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
