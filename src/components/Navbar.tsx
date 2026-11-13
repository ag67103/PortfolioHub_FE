import React, { useState, useEffect } from 'react';
import { getNavigationItems } from '../config/navigation';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
    const { isAuthenticated, isMe, isValidUser, logout, isCurrentUserLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = getNavigationItems(isMe, isValidUser);
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
        if (item.isRoute) {
            if (item.path === '/' && location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                navigate(item.path);
            }
        } else {
            const sectionId = item.path.replace('#', '');
            if (location.pathname === '/') {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/', { state: { scrollTo: sectionId } });
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'nav-glass' : 'bg-transparent border-b border-transparent'}`}>
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo — always visible */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="Portfolio Hub" className="h-8 w-8" />
                        <span className="font-grotesk font-semibold text-ink-primary text-sm hidden sm:block tracking-tight">
                            Portfolio<span className="text-accent-indigo">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop nav — only show section links when on a portfolio page */}
                    {!isLanding && (
                        <div className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item)}
                                    className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-obsidian-card rounded-lg transition-all duration-200"
                                >
                                    {item.label}
                                </button>
                            ))}
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
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-red-400 border border-obsidian-border hover:border-red-500/40 rounded-lg transition-all duration-200">
                                Logout
                            </button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-obsidian-card rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-obsidian-border">
                        <div className="flex flex-col gap-1">
                            {!isLanding && navItems.map((item) => (
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
                                    <button
                                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                        className="px-4 py-2.5 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
                                        Logout
                                    </button>
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
