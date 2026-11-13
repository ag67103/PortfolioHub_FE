import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { Check, Download, Mail, Share2, Edit2, MapPin, Eye } from "lucide-react";
import { safeHref } from "../../utils/utility";
import { ModalOverlay } from "../forms/ModalOverlay";
import EditPortfolioForm from "../forms/EditPortfolioForm";
import { downloadResume } from "../../services/api";

const initials = (user: any) => {
    if (!user) return 'PH';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
};

const HeroSection = () => {
    const { currentUser, isMe, isValidUser } = useAuth();
    const { userId } = useParams<{ userId?: string }>();
    const [showCopied, setShowCopied] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    const hasName = !!(currentUser?.first_name || currentUser?.last_name);
    const fullName = hasName
        ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()
        : currentUser?.username || '';

    const handleShare = () => {
        const uid = currentUser?.id;
        if (uid) {
            // Prefer the short public link (/u/<name>) when the owner has set one
            const path = currentUser?.slug ? `/u/${currentUser.slug}` : `/user/${uid}`;
            navigator.clipboard.writeText(`${window.location.origin}${path}`);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        }
    };

    const handleResumeDownload = async () => {
        try {
            const targetUserId = userId || currentUser?.id;
            if (!targetUserId) { alert('Unable to determine user. Please try again.'); return; }
            await downloadResume(targetUserId);
        } catch (error: any) {
            alert(error.message || 'Failed to download resume.');
        }
    };

    const firstSentence = (text?: string) => {
        const first = (text || '').trim().split('\n')[0];
        const m = first.match(/^.*?[.!?](?=\s|$)/);
        return m ? m[0] : first;
    };
    const socials = [
        { label: 'GitHub', url: currentUser?.github_url },
        { label: 'LinkedIn', url: currentUser?.linkedin_url },
        { label: 'LeetCode', url: currentUser?.leetcode_url },
    ].filter(l => l.url);

    if (!currentUser) return null;

    return (
        <section className="relative section-obsidian overflow-hidden">
            {/* Subtle top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-accent-indigo/50 to-transparent" />

            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent-indigo/8 rounded-full blur-3xl -translate-y-1/2" />
            </div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10 py-16 lg:py-24">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-14">

                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="relative w-24 h-24 lg:w-32 lg:h-32">
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-cyan opacity-40 blur-md scale-110" />
                            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-cyan flex items-center justify-center">
                                <span className="font-grotesk text-3xl lg:text-4xl font-bold text-white select-none">
                                    {initials(currentUser)}
                                </span>
                            </div>
                        </div>
                        {/* Online indicator */}
                        {isMe && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-obsidian-bg" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        {hasName ? (
                            <>
                                <div className="flex items-start gap-3 flex-wrap mb-2">
                                    <h1 className="font-grotesk text-3xl lg:text-5xl font-bold text-ink-primary leading-tight">
                                        {fullName}
                                    </h1>
                                    {isMe && (
                                        <button
                                            onClick={() => setShowEditForm(true)}
                                            className="mt-1 p-1.5 text-ink-muted hover:text-ink-primary hover:bg-obsidian-card rounded-lg transition-colors shrink-0"
                                            aria-label="Edit profile"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </div>

                                {currentUser.portfolio_title && (
                                    <p className="text-lg text-accent-light font-medium mb-2">
                                        {currentUser.portfolio_title}
                                    </p>
                                )}

                                {(currentUser.open_to_work || currentUser.address) && (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-sm">
                                        {currentUser.open_to_work && (
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" /> Open to opportunities
                                            </span>
                                        )}
                                        {currentUser.address && (
                                            <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                                                <MapPin size={14} aria-hidden="true" /> {currentUser.address}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {currentUser.portfolio_description && (
                                    <p className="text-ink-secondary max-w-xl leading-relaxed mb-5 text-sm lg:text-base">
                                        {firstSentence(currentUser.portfolio_description)}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    <button onClick={handleResumeDownload}
                                        className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm">
                                        <Download size={14} /> Resume
                                    </button>
                                    {currentUser.email && (
                                        <a href={`mailto:${currentUser.email}`}
                                            className="btn-ghost flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm">
                                            <Mail size={14} /> Email me
                                        </a>
                                    )}
                                    <button onClick={handleShare}
                                        className="btn-ghost flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm">
                                        {showCopied
                                            ? <><Check size={14} className="text-green-400" /> Copied!</>
                                            : <><Share2 size={14} /> Share</>}
                                    </button>
                                </div>

                                {socials.length > 0 && (
                                    <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm" aria-label="Profiles">
                                        {socials.map(l => (
                                            <li key={l.label}>
                                                <a href={safeHref(l.url) || '#'} target="_blank" rel="noopener noreferrer"
                                                    className="text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline">
                                                    {l.label}<span className="sr-only"> (opens in a new tab)</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            /* Incomplete profile prompt */
                            <div className="max-w-lg">
                                <h1 className="font-grotesk text-2xl lg:text-3xl font-bold text-ink-primary mb-2">
                                    {isMe ? 'Complete your profile' : 'Profile coming soon'}
                                </h1>
                                <p className="text-ink-secondary mb-5 text-sm leading-relaxed">
                                    {isMe
                                        ? 'Add your name and title so visitors know who you are.'
                                        : `${currentUser.username || 'This user'} hasn't filled in their portfolio yet.`}
                                </p>
                                {isMe && (
                                    <button onClick={() => setShowEditForm(true)}
                                        className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm">
                                        <Edit2 size={14} /> Add your information
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Views count */}
                    {hasName && currentUser.visitor_count > 0 && (
                        <div className="shrink-0 inline-flex items-center gap-2 text-sm text-ink-muted" title="Profile views">
                            <Eye size={14} aria-hidden="true" />
                            <span>{currentUser.visitor_count >= 1000 ? `${(currentUser.visitor_count / 1000).toFixed(1)}k` : currentUser.visitor_count} views</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-obsidian-border to-transparent" />

            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <EditPortfolioForm
                        portfolioData={currentUser || {}}
                        setShowForm={setShowEditForm}
                    />
                </ModalOverlay>
            )}
        </section>
    );
};

export default HeroSection;
