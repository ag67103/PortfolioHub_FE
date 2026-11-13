import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import SkillsSection from "../components/sections/SkillsSection";
import ProjectSection from "../components/sections/ProjectSection";
import ExperienceSection from "../components/sections/ExperienceSection";
import EducationSection from "../components/sections/EducationSection";
import CertificationSection from "../components/sections/CertificationSection";
import AwardsSection from "../components/sections/AwardsSection";
import { useAuth } from "../context/AuthContext";
import ContactManagement from "../components/sections/ContactManagement";
import ContactSection from "../components/sections/ContactSection";
import Footer from "../components/Footer";

const Home: React.FC = () => {
    const { isMe, isValidUser, isCurrentUserLoading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollTo) {
            const sectionId = location.state.scrollTo;
            setTimeout(() => {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [location.state]);

    // isCurrentUserLoading is the authoritative "still initialising" flag —
    // it resolves after both getLoggedInUser + getCurrentUser complete.
    if (isCurrentUserLoading) {
        return (
            <div className="min-h-screen section-obsidian flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
                    <span className="text-ink-muted text-sm">Loading…</span>
                </div>
            </div>
        );
    }

    // Authenticated or viewing someone's profile → show portfolio
    return (
        <div className="min-h-screen section-obsidian">
            <HeroSection />
            <AboutSection />
            <SkillsSection />
            <ProjectSection />
            <ExperienceSection />
            <EducationSection />
            <CertificationSection />
            <AwardsSection />
            {!isMe && isValidUser && <ContactSection />}
            {isMe && <ContactManagement />}
            <Footer />
        </div>
    );
};

export default Home;
