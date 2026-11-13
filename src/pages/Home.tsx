import React, { Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../components/sections/HeroSection";
import { useAuth } from "../context/AuthContext";
import BackToTop from "../components/BackToTop";
import Footer from "../components/Footer";
import LandingPage from "./LandingPage";
import { EyeOff } from "lucide-react";

// Sections below the hero are split into their own chunks so the first screen paints sooner
const AboutSection = React.lazy(() => import("../components/sections/AboutSection"));
const ProjectSection = React.lazy(() => import("../components/sections/ProjectSection"));
const ExperienceSection = React.lazy(() => import("../components/sections/ExperienceSection"));
const SkillsSection = React.lazy(() => import("../components/sections/SkillsSection"));
const EducationSection = React.lazy(() => import("../components/sections/EducationSection"));
const CertificationSection = React.lazy(() => import("../components/sections/CertificationSection"));
const AwardsSection = React.lazy(() => import("../components/sections/AwardsSection"));
const ContactSection = React.lazy(() => import("../components/sections/ContactSection"));

const Home: React.FC = () => {
    const { isMe, isOwner, isValidUser, isCurrentUserLoading, isAuthenticated, currentUser, previewMode, setPreviewMode } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollTo) {
            const sectionId = location.state.scrollTo;
            // sections are lazy-loaded: retry until the target exists
            let tries = 0;
            const timer = window.setInterval(() => {
                const el = document.getElementById(sectionId);
                if (el || ++tries > 20) {
                    window.clearInterval(timer);
                    el?.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
            return () => window.clearInterval(timer);
        }
    }, [location.state]);

    useEffect(() => {
        const name = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ');
        document.title = name ? `${name} | Portfolio` : 'Portfolio Hub';
    }, [currentUser]);

    // isCurrentUserLoading is the authoritative "still initialising" flag —
    // it resolves after both getLoggedInUser + getCurrentUser complete.
    if (isCurrentUserLoading) {
        return (
            <div className="min-h-screen section-obsidian flex items-center justify-center" role="status">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
                    <span className="text-ink-muted text-sm">Loading…</span>
                </div>
            </div>
        );
    }

    // Logged-out visitor on the home page: there is no profile to show, so show the product landing page
    if (!isAuthenticated && location.pathname === '/') {
        return <LandingPage />;
    }

    // Order follows what visitors look for first: who you are, what you built, where you worked
    return (
        <div className="min-h-screen section-obsidian">
            {isOwner && previewMode && (
                <div className="bg-accent-indigo/15 border-b border-accent-indigo/30 text-sm text-ink-primary" role="status">
                    <div className="container mx-auto px-4 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
                        <span>You're previewing your portfolio as a visitor would see it.</span>
                        <button onClick={() => setPreviewMode(false)} className="flex items-center gap-1.5 font-medium text-accent-light hover:underline">
                            <EyeOff size={14} /> Exit preview
                        </button>
                    </div>
                </div>
            )}
            <HeroSection />
            <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
                <ProjectSection />
                <ExperienceSection />
                <AboutSection />
                <SkillsSection />
                <EducationSection />
                <CertificationSection />
                <AwardsSection />
                {!isMe && isValidUser && <ContactSection />}
                <Footer />
            </Suspense>
            <BackToTop />
        </div>
    );
};

export default Home;
