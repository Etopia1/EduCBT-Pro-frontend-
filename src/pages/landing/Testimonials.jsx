const testimonials = [
    {
        name: 'Mr. Emeka Okafor',
        role: 'Vice Principal, Lagos State Secondary School',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
        quote:
            'EduCBT Pro completely eliminated exam malpractice in our school. The AI proctoring catches everything — students have stopped even trying to cheat. Our SS3 trial exams now run in 30 minutes flat.',
        rating: 5,
    },
    {
        name: 'Mrs. Fatima Bello',
        role: 'Head of Computer Science, Abuja Model School',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80',
        quote:
            "Setting up our first CBT exam took less than 15 minutes. I uploaded 80 questions from Word, set the timer, and published to all SS2 students. Results were ready before the last student even stood up from their seat!",
        rating: 5,
    },
    {
        name: 'Chukwuemeka Eze',
        role: 'SS3 Student, Federal Government College, Enugu',
        avatar: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=100&q=80',
        quote:
            "I love that I can see my score immediately after submitting. It helps me know which subjects I need to focus on before WAEC. The platform is very easy to use on my phone.",
        rating: 5,
    },
    {
        name: 'Mrs. Grace Adeyemi',
        role: 'Principal, Ogun State Secondary School',
        avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=100&q=80',
        quote:
            "Before EduCBT Pro, marking 400 scripts took our teachers 3 days. Now the system marks everything in seconds. My teachers now have time to actually teach instead of spending weekends marking.",
        rating: 5,
    },
    {
        name: 'Mr. Tunde Abiodun',
        role: 'Mathematics Teacher, Ibadan Secondary School',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
        quote:
            "The analytics report is incredible. I can see which specific questions my students failed the most, which tells me exactly what to re-teach. No other platform gives me this level of insight.",
        rating: 5,
    },
    {
        name: 'Amina Mohammed',
        role: 'JSS3 Student, Government Secondary School, Kano',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80',
        quote:
            "I was scared of computer exams at first but EduCBT Pro is so simple. The questions look exactly like our BECE practice papers. I scored higher than I expected!",
        rating: 5,
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <span className="inline-block text-pink-400 text-sm font-semibold uppercase tracking-widest mb-3">
                        What Schools Are Saying
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Loved by Teachers, Students &amp; Principals
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Real stories from Nigerian secondary schools using EduCBT Pro every day.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {testimonials.map(({ name, role, avatar, quote, rating }) => (
                        <div
                            key={name}
                            className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 hover:border-slate-600/60 hover:bg-slate-800/60 transition-all duration-300 flex flex-col"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: rating }).map((_, i) => (
                                    <span key={i} className="text-amber-400 text-sm">★</span>
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-5">"{quote}"</p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                                <img
                                    src={avatar}
                                    alt={name}
                                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-600/50"
                                />
                                <div>
                                    <p className="text-white text-sm font-semibold">{name}</p>
                                    <p className="text-slate-500 text-xs">{role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
