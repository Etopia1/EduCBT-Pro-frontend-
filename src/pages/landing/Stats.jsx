const stats = [
    { value: '500+', label: 'Secondary Schools', sub: 'Across Nigeria', color: 'from-indigo-400 to-purple-400' },
    { value: '120k+', label: 'Exams Conducted', sub: 'No paper wasted', color: 'from-purple-400 to-pink-400' },
    { value: '98%', label: 'School Satisfaction', sub: 'From verified reviews', color: 'from-pink-400 to-rose-400' },
    { value: '<2s', label: 'Result Delivery', sub: 'After submission', color: 'from-amber-400 to-orange-400' },
    { value: '16+', label: 'Subjects Supported', sub: 'Full WAEC curriculum', color: 'from-emerald-400 to-teal-400' },
    { value: '0 hrs', label: 'Manual Marking', sub: 'All auto-graded', color: 'from-sky-400 to-cyan-400' },
];

export default function Stats() {
    return (
        <section id="stats" className="py-20 bg-slate-900 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <span className="inline-block text-pink-400 text-sm font-semibold uppercase tracking-widest mb-3">
                        Proven At Scale
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                        Numbers That Speak for Themselves
                    </h2>
                    <p className="text-slate-400 text-lg">Real data from real Nigerian secondary schools.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {stats.map(({ value, label, sub, color }) => (
                        <div
                            key={label}
                            className="relative bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 text-center hover:border-slate-600/60 hover:bg-slate-800/60 transition-all duration-300 group overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color}`} />
                            <p className={`text-4xl font-extrabold bg-gradient-to-br ${color} bg-clip-text text-transparent mb-1 group-hover:scale-105 transition-transform duration-300`}>
                                {value}
                            </p>
                            <p className="text-white font-semibold text-sm mb-1">{label}</p>
                            <p className="text-slate-500 text-xs">{sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
