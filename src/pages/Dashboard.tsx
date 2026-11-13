import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ExternalLink, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ContactManagement from '../components/sections/ContactManagement';

/** Owner-only area: messages and quick links. Keeps the public portfolio free of admin UI. */
const Dashboard: React.FC = () => {
    const { isAuthenticated, isCurrentUserLoading, currentUser, setPreviewMode } = useAuth();

    useEffect(() => { document.title = 'Dashboard | Portfolio Hub'; }, []);

    if (isCurrentUserLoading) {
        return (
            <div className="min-h-screen section-obsidian flex items-center justify-center" role="status">
                <div className="w-8 h-8 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
                <span className="sr-only">Loading…</span>
            </div>
        );
    }
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const publicPath = currentUser?.slug ? `/u/${currentUser.slug}` : `/user/${currentUser?.id}`;

    return (
        <div className="min-h-screen section-obsidian">
            <div className="container mx-auto px-4 lg:px-8 pt-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-grotesk text-3xl font-bold text-ink-primary">Dashboard</h1>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/" className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                            <ExternalLink size={14} /> Edit my portfolio
                        </Link>
                        <Link to={publicPath} onClick={() => setPreviewMode(true)}
                            className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                            <Eye size={14} /> Preview as visitor
                        </Link>
                    </div>
                </div>
                {currentUser?.slug && (
                    <p className="mt-3 text-sm text-ink-muted">
                        Your public link: <a className="text-accent-light underline" href={publicPath}>{window.location.origin}{publicPath}</a>
                    </p>
                )}
            </div>
            <ContactManagement />
        </div>
    );
};

export default Dashboard;
