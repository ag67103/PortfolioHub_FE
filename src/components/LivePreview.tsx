import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { getProjectEmbeddable } from '../services/api';

interface LivePreviewProps {
    projectId: string;
    url: string;
    title: string;
}

const FRAME_WIDTH = 1280;   // the site is rendered at desktop size, then scaled down to fit the card
const FRAME_HEIGHT = 800;

const hostOf = (url: string) => {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
};

/**
 * A real-time preview of a project's running site: the actual page is loaded in a scaled-down,
 * non-interactive frame (nothing is stored). Sites that forbid being embedded (X-Frame-Options / CSP
 * frame-ancestors) get a clean "Open live site" card instead of an error page.
 */
const LivePreview: React.FC<LivePreviewProps> = ({ projectId, url, title }) => {
    const box = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    const [state, setState] = useState<'idle' | 'checking' | 'live' | 'blocked'>('idle');
    const [loaded, setLoaded] = useState(false);
    const [scale, setScale] = useState(0.25);

    // Only start work when the card is near the viewport (keeps the page fast)
    useEffect(() => {
        const el = box.current;
        if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
        const io = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) { setInView(true); io.disconnect(); }
        }, { rootMargin: '300px' });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        if (!inView) return;
        let cancelled = false;
        setState('checking');
        getProjectEmbeddable(projectId).then(r => { if (!cancelled) setState(r.embeddable ? 'live' : 'blocked'); });
        return () => { cancelled = true; };
    }, [inView, projectId]);

    useEffect(() => {
        const el = box.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(() => setScale(el.clientWidth / FRAME_WIDTH));
        ro.observe(el);
        setScale(el.clientWidth / FRAME_WIDTH);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={box} className="relative w-full aspect-[16/10] overflow-hidden rounded-xl border border-obsidian-border bg-obsidian-surface">
            {state === 'live' ? (
                <>
                    {!loaded && <div className="absolute inset-0 animate-pulse bg-obsidian-card" aria-hidden="true" />}
                    <iframe
                        src={url}
                        title={`Live preview of ${title}`}
                        loading="lazy"
                        tabIndex={-1}
                        sandbox="allow-scripts allow-same-origin"
                        referrerPolicy="no-referrer"
                        onLoad={() => setLoaded(true)}
                        width={FRAME_WIDTH}
                        height={FRAME_HEIGHT}
                        style={{ border: 0, transformOrigin: '0 0', transform: `scale(${scale})`, pointerEvents: 'none', background: '#fff' }}
                    />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 text-[11px] font-medium text-green-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" /> Live
                    </span>
                    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title} live site (opens in a new tab)`}
                       className="absolute inset-0" />
                </>
            ) : (
                <a href={url} target="_blank" rel="noopener noreferrer"
                   className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-gradient-to-br from-accent-indigo/15 via-obsidian-card to-accent-cyan/10 hover:from-accent-indigo/25 transition-colors">
                    <span className="font-grotesk text-lg font-semibold text-ink-primary break-all">{hostOf(url)}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-accent-light">
                        <ExternalLink size={14} aria-hidden="true" />
                        {state === 'checking' ? 'Checking live site…' : 'Open live site'}
                        <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                </a>
            )}
        </div>
    );
};

export default LivePreview;
