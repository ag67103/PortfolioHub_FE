import React, { useState, useEffect } from 'react';
import { getNavigationItems } from '../config/navigation';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LayoutDashboard, Menu, X } from 'lucide-react';
import { useScrollSpy } from '../hooks/useScrollSpy';

const Navbar: React.FC = () => {
    const { isAuthenticated, isMe, isOwner, isValidUser, logout, isCurrentUserLoading, currentUser, previewMode, setPreviewMode } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = getNavigationItems(isMe, isValidUser);
    const onProfile = location.pathname === '/' || location.pathname.startsWith('/u/') || location.pathname.startsWith('/user/');
    const onDashboard = location.pathname === '/dashboard';
    const activeId = useScrollSpy(navItems.map(i => i.path.replace('#', '')), onProfile && !isCurrentUserLoading);
    const ownPath = currentUser?.slug ? `/u/${currentUser.slug}` : '/';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Landing page = auth resolved, not authenticated, not on a user profile page
    const isLanding = !isCurrentUserLoading && !isAuthenticated && !isValidUser;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

    const handleNavClick = (item: { path: string; isRoute: boolean; label: string }) => {
        const sectionId = item.path.replace('#', '');
        if (onProfile) {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
            // e.g. from the dashboard: go to the owner's portfolio, then scroll
            navigate(isAuthenticated ? ownPath : '/', { state: { scrollTo: sectionId } });
        }
    };

    const togglePreview = () => {
        setPreviewMode(!previewMode);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav aria-label="Main" className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'nav-glass' : 'bg-transparent border-b border-transparent'}`}>
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo — always visible */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo192.png" alt="Portfolio Hub" width={32} height={32} className="h-8 w-8" />
                        <span className="font-grotesk font-semibold text-ink-primary text-sm hidden sm:block tracking-tight">
                            Portfolio<span className="text-accent-light">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop nav — only show section links when on a portfolio page */}
                    {!isLanding && (
                        <div className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => {
                                const active = activeId === item.path.replace('#', '');
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => handleNavClick(item)}
                                        aria-current={active ? 'true' : undefined}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:text-ink-primary hover:bg-obsidian-card ${active ? 'text-ink-primary bg-obsidian-card' : 'text-ink-secondary'}`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                            {isOwner && onProfile && (
                                <button onClick={togglePreview}
                                    className="ml-2 flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary border border-obsidian-border hover:border-accent-indigo/50 rounded-lg transition-all duration-200"
                                    aria-pressed={previewMode}>
                                    {previewMode ? <><EyeOff size={14} /> Exit preview</> : <><Eye size={14} /> Preview as visitor</>}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Auth buttons */}
                    <div className="hidden lg:flex items-center gap-3">
                        {isLanding ? (
                            /* Landing page: simple sign-in + get started */
                            <>
                                <Link to="/login"
                                    className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors">
                                    Sign in
                                </Link>
                                <Link to="/register"
                                    className="btn-glow px-5 py-2 text-sm rounded-lg">
                                    Get started free
                                </Link>
                            </>
                        ) : !isAuthenticated ? (
                            <>
                                <Link to="/login"
                                    className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary border border-obsidian-border hover:border-accent-indigo/50 rounded-lg transition-all duration-200">
                                    Login
                                </Link>
                                <Link to="/register"
                                    className="btn-glow px-4 py-2 text-sm rounded-lg">
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to={onDashboard ? ownPath : '/dashboard'}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary border border-obsidian-border hover:border-accent-indigo/50 rounded-lg transition-all duration-200">
                                    <LayoutDashboard size={14} /> {onDashboard ? 'My portfolio' : 'Dashboard'}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-red-400 border border-obsidian-border hover:border-red-500/40 rounded-lg transition-all duration-200">
                                    Logout
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-obsidian-card rounded-lg transition-colors"
                        aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-obsidian-border">
                        <div className="flex flex-col gap-1">
                            {!isLanding && !onDashboard && navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => { handleNavClick(item); setIsMobileMenuOpen(false); }}
                                    className="text-left px-4 py-3 text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-obsidian-card rounded-lg transition-colors"
                                >
                                    {item.label}
                                </button>
                            ))}

                            <div className="mt-3 pt-3 border-t border-obsidian-border flex flex-col gap-2">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                                            className="px-4 py-2.5 text-sm font-medium text-center text-ink-secondary border border-obsidian-border rounded-lg hover:border-accent-indigo/50 hover:text-ink-primary transition-colors">
                                            Sign in
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}
                                            className="btn-glow px-4 py-2.5 text-sm text-center rounded-lg">
                                            {isLanding ? 'Get started free' : 'Register'}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                    <Link to={onDashboard ? ownPath : '/dashboard'} onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-4 py-2.5 text-sm font-medium text-center text-ink-secondary border border-obsidian-border rounded-lg hover:border-accent-indigo/50 hover:text-ink-primary transition-colors">
                                        {onDashboard ? 'My portfolio' : 'Dashboard'}
                                    </Link>
                                    {isOwner && onProfile && (
                                        <button onClick={() => { togglePreview(); setIsMobileMenuOpen(false); }}
                                            className="px-4 py-2.5 text-sm font-medium text-ink-secondary border border-obsidian-border rounded-lg hover:border-accent-indigo/50 hover:text-ink-primary transition-colors">
                                            {previewMode ? 'Exit preview' : 'Preview as visitor'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                        className="px-4 py-2.5 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
                                        Logout
                                    </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
