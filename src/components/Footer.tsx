import { useAuth } from "../context/AuthContext";
import { Github, Linkedin, Mail, ExternalLink, Eye } from "lucide-react";

const Footer: React.FC = () => {
    const { currentUser, isMe, isValidUser } = useAuth();
    const currentYear = new Date().getFullYear();

    const getFullName = () => {
        if (!currentUser) return '';
        const parts = [currentUser.first_name, currentUser.middle_name, currentUser.last_name].filter(Boolean);
        return parts.join(' ') || currentUser.username || '';
    };

    const scrollTo = (id: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const navLinks = [
        { id: 'about', label: 'About' },
        { id: 'skills', label: 'Skills' },
        { id: 'projects', label: 'Projects' },
        { id: 'experience', label: 'Experience' },
        { id: 'education', label: 'Education' },
    ];

    return (
        <footer className="bg-obsidian-surface border-t border-obsidian-border">
            <div className="container mx-auto px-4 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="font-grotesk font-semibold text-ink-primary">
                                Portfolio<span className="text-accent-light">Hub</span>
                            </span>
                        </div>
                        <p className="text-ink-muted text-sm leading-relaxed">
                            {currentUser?.portfolio_description || 'Professional portfolio showcasing skills, experience, and projects.'}
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h3 className="font-grotesk font-semibold text-ink-primary mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-2">
                            {navLinks.map(({ id, label }) => (
                                <li key={id}>
                                    <a href={`#${id}`} onClick={scrollTo(id)} className="text-ink-muted hover:text-ink-primary transition-colors text-sm">
                                        {label}
                                    </a>
                                </li>
                            ))}
                            {!isMe && isValidUser && (
                                <li>
                                    <a href="#contact" onClick={scrollTo('contact')} className="text-ink-muted hover:text-ink-primary transition-colors text-sm">
                                        Contact
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Social links */}
                    <div>
                        <h3 className="font-grotesk font-semibold text-ink-primary mb-4 text-sm uppercase tracking-wider">Connect</h3>
                        <div className="flex flex-col gap-3">
                            {currentUser?.github_url && (
                                <a href={currentUser.github_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-ink-muted hover:text-accent-light transition-colors text-sm">
                                    <Github size={15} /> <span>GitHub</span> <ExternalLink size={12} className="opacity-40" />
                                </a>
                            )}
                            {currentUser?.linkedin_url && (
                                <a href={currentUser.linkedin_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-ink-muted hover:text-accent-light transition-colors text-sm">
                                    <Linkedin size={15} /> <span>LinkedIn</span> <ExternalLink size={12} className="opacity-40" />
                                </a>
                            )}
                            {currentUser?.email && (
                                <a href={`mailto:${currentUser.email}`}
                                    className="flex items-center gap-2 text-ink-muted hover:text-accent-light transition-colors text-sm">
                                    <Mail size={15} /> <span>{currentUser.email}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-obsidian-border pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        <div className="flex flex-col gap-1">
                            <p className="text-ink-muted text-xs">
                                © {currentYear} {getFullName() || 'User'}. All rights reserved.
                            </p>
                            <p className="text-ink-faint text-xs">
                                Platform © {currentYear} Avinash Gupta
                            </p>
                            {currentUser && (currentUser.visitor_count ?? 0) > 0 && (
                                <div className="flex items-center gap-1.5 text-ink-muted text-xs mt-1">
                                    <Eye size={12} />
                                    <span>{(currentUser.visitor_count).toLocaleString()} visitor{currentUser.visitor_count !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-5 text-xs text-ink-muted">
                            <a href="/privacy-policy" className="hover:text-ink-primary transition-colors">Privacy Policy</a>
                            <a href="/terms-of-service" className="hover:text-ink-primary transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
