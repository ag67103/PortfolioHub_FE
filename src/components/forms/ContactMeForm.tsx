import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { sendAuthenticatedUserMessage, sendUnauthenticatedUserMessage } from "../../services/api";
import { Mail, User, Send, MessageSquare } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";

export const ContactMeForm = () => {
    const [message, setMessage] = useState({
        senderName: '',
        senderEmail: '',
        recipientEmail: '',
        messageSubject: '',
        messageContent: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSendButtonActive, setIsSendButtonActive] = useState(false);
    const { setIsMessageLoading, setIsMessageCountLoading } = usePortfolio();
    const { isMe, loggedInUser, currentUser, isAuthenticated } = useAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMessage(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        if (loggedInUser) {
            setMessage(prev => ({
                ...prev,
                senderEmail: loggedInUser.email || '',
                senderName: `${loggedInUser.first_name || ''} ${loggedInUser.last_name || ''}`.trim(),
            }));
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (currentUser?.email) {
            setMessage(prev => ({ ...prev, recipientEmail: currentUser.email }));
        }
    }, [currentUser]);

    useEffect(() => {
        const basicFilled = message.senderName.trim() !== '' && message.senderEmail.trim() !== '' && message.messageContent.trim() !== '';
        const recipientFilled = isAuthenticated ? message.recipientEmail.trim() !== '' : !!currentUser?.id;
        setIsSendButtonActive(basicFilled && recipientFilled);
    }, [message, isAuthenticated, currentUser]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            setLoading(true);
            setError('');
            setSuccess(false);
            e.preventDefault();

            let response;
            if (isAuthenticated) {
                response = await sendAuthenticatedUserMessage({
                    messageSubject: message.messageSubject.trim() || undefined,
                    messageContent: message.messageContent,
                    recipientEmail: message.recipientEmail || currentUser?.email || '',
                });
            } else {
                if (!currentUser?.id) throw new Error('Unable to determine recipient. Please refresh the page.');
                response = await sendUnauthenticatedUserMessage({
                    senderName: message.senderName,
                    senderEmail: message.senderEmail,
                    messageSubject: message.messageSubject.trim() || undefined,
                    messageContent: message.messageContent,
                    recipientUserId: currentUser.id,
                });
            }

            if (response.status_code === 400) throw new Error(response.message ?? 'Failed to send message');

            setSuccess(true);
            setMessage({ senderName: '', senderEmail: '', recipientEmail: '', messageSubject: '', messageContent: '' });
            if (isAuthenticated) { setIsMessageLoading(true); setIsMessageCountLoading(true); }
            setTimeout(() => setSuccess(false), 5000);
        } catch (error: any) {
            setError(error.message ?? 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-lg border border-obsidian-border bg-obsidian-surface text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30 transition-colors text-sm";
    const labelCls = "flex items-center gap-2 text-sm font-medium text-ink-secondary mb-2";

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-5">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>
            )}
            {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400">
                    Message sent successfully! Thank you for reaching out.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                    <label className={labelCls}><User className="w-4 h-4 text-accent-indigo" /> Your Name</label>
                    <input type="text" name="senderName" placeholder="John Doe" value={message.senderName} onChange={handleInputChange} className={inputCls} required />
                </div>
                <div>
                    <label className={labelCls}><Mail className="w-4 h-4 text-accent-indigo" /> Your Email</label>
                    <input type="email" name="senderEmail" placeholder="john@example.com" value={message.senderEmail} onChange={handleInputChange} className={inputCls} required />
                </div>
            </div>

            <div>
                <label className={labelCls}>
                    <MessageSquare className="w-4 h-4 text-accent-indigo" />
                    Subject <span className="text-ink-muted text-xs font-normal">(optional)</span>
                </label>
                <input type="text" name="messageSubject" placeholder="What's this about?" value={message.messageSubject} onChange={handleInputChange} className={inputCls} />
            </div>

            <div>
                <label className={labelCls}><MessageSquare className="w-4 h-4 text-accent-indigo" /> Message</label>
                <textarea
                    name="messageContent"
                    placeholder="Type your message here..."
                    value={message.messageContent}
                    onChange={handleInputChange}
                    className={`${inputCls} resize-none`}
                    rows={6}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={!isSendButtonActive}
                className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                    isSendButtonActive ? 'btn-glow' : 'bg-obsidian-surface border border-obsidian-border text-ink-muted cursor-not-allowed'
                }`}
            >
                {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                )}
            </button>
        </form>
    );
};
