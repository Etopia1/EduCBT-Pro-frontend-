const images = [
    {
        src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
        alt: 'Students writing exam in a computer lab',
        label: 'Computer-Based Testing',
    },
    {
        src: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&q=80',
        alt: 'Secondary school student using laptop',
        label: 'Smart Learning',
    },
    {
        src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
        alt: 'Teacher assisting students in class',
        label: 'Teacher-Led Monitoring',
    },
    {
        src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
        alt: 'Students studying with tablets',
        label: 'Any Device, Anywhere',
    },
    {
        src: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80',
        alt: 'Happy students after exam',
        label: 'Instant Results',
    },
    {
        src: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80',
        alt: 'Group of secondary school students',
        label: 'Built for SS1 – SS3',
    },
];

export default function StudentGallery() {
    return (
        <section id="gallery" className="py-24 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_60%)]" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-14">
                    <span className="inline-block text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
                        Real Schools. Real Students.
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Built for the Nigerian{' '}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Secondary School
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        EduCBT Pro is designed around the WAEC/NECO exam structure, JSS & SS curricula, 
                        and the realities of Nigerian secondary school life.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map(({ src, alt, label }) => (
                        <div key={alt} className="relative rounded-2xl overflow-hidden group cursor-default aspect-[4/3]">
                            <img
                                src={src}
                                alt={alt}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <span className="text-white text-sm font-semibold">{label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
