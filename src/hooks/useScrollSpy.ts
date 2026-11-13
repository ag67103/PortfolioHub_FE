import { useEffect, useState } from 'react';

/** Returns the id of the section that is currently in view (for highlighting the nav). */
export const useScrollSpy = (ids: string[], enabled: boolean = true): string | null => {
    const [active, setActive] = useState<string | null>(null);
    const key = ids.join('|');

    useEffect(() => {
        if (!enabled || typeof IntersectionObserver === 'undefined') return;
        const visible = new Map<string, number>();
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
                    else visible.delete(e.target.id);
                });
                // Prefer the section nearest the top of the viewport among those visible
                const order = ids.filter(id => visible.has(id));
                setActive(order.length ? order[0] : null);
            },
            { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01] }
        );
        const watch = () => ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
        watch();
        // Sections are lazy-loaded, so look again shortly after the first render
        const retry = window.setTimeout(watch, 1200);
        return () => { observer.disconnect(); window.clearTimeout(retry); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, enabled]);

    return active;
};
