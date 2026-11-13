import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop: React.FC = () => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 900);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    if (!show) return null;
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="fixed bottom-5 right-5 z-40 p-3 rounded-full bg-obsidian-card border border-obsidian-border text-ink-secondary hover:text-ink-primary hover:border-accent-indigo/60 shadow-lg transition-colors"
        >
            <ArrowUp size={18} />
        </button>
    );
};

export default BackToTop;
