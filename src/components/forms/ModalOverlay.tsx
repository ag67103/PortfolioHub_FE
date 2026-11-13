import { useEffect } from "react";
import { X } from "lucide-react";

const ModalOverlaySkills: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => { document.body.classList.remove('overflow-hidden'); };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-auto p-4">
            <div className="bg-obsidian-card border border-obsidian-border rounded-2xl shadow-2xl p-6 relative w-full max-w-md mx-auto">
                <button
                    className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded-lg transition-colors"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={16} />
                </button>
                {children}
            </div>
        </div>
    );
};

const ModalOverlay: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => { document.body.classList.remove('overflow-hidden'); };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-auto p-4">
            <div className="bg-obsidian-card border border-obsidian-border rounded-2xl shadow-2xl p-6 relative w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto scrollbar-thin">
                <button
                    className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded-lg transition-colors z-10"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={16} />
                </button>
                {children}
            </div>
        </div>
    );
};

export { ModalOverlay, ModalOverlaySkills };
