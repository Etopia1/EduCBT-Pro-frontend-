import Navbar from './landing/Navbar';
import Hero from './landing/Hero';
import Stats from './landing/Stats';
import Features from './landing/Features';
import SubjectCoverage from './landing/SubjectCoverage';
import HowItWorks from './landing/HowItWorks';
import StudentGallery from './landing/StudentGallery';
import Testimonials from './landing/Testimonials';
import Pricing from './landing/Pricing';
import FAQ from './landing/FAQ';
import CallToAction from './landing/CallToAction';
import Footer from './landing/Footer';

export default function LandingPage() {
    return (
        <div className="bg-slate-950 min-h-screen">
            <Navbar />
            <Hero />
            <Stats />
            <Features />
            <SubjectCoverage />
            <HowItWorks />
            <StudentGallery />
            <Testimonials />
            <Pricing />
            <FAQ />
            <CallToAction />
            <Footer />
        </div>
    );
}
