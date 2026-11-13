import { FormEvent, useState, useEffect } from "react";
import { Message } from "../../services/modal";
import { usePortfolio } from "../../context/PortfolioContext";
import { Send, X } from "lucide-react";
import { sendAuthenticatedUserMessage } from "../../services/api";
import { groupMessage } from "../utils/ContactManagementUtils";

interface ComposeMessageFormProps {
    selectedConversation: Message[];
    setSelectedConversation: (conversation: Message[]) => void;
    setSelectedMessage: (message: Message) => void;
    chatPartnerEmail: string;
    currentUser: any;
}

const ComposeMessageForm: React.FC<ComposeMessageFormProps> = ({ selectedConversation, setSelectedConversation, setSelectedMessage, currentUser, chatPartnerEmail }) => {
    const [composerMessage, setComposerMessage] = useState('');
    const [isSendingComposer, setIsSendingComposer] = useState(false);
    const [composerError, setComposerError] = useState<string | null>(null);
    const [composerSubject, setComposerSubject] = useState('');
    const { getMessages, getMessageCount } = usePortfolio();

    useEffect(() => {
        const latest = selectedConversation.length > 0 ? selectedConversation[selectedConversation.length - 1] : null;
        setComposerSubject(latest?.messageSubject ?? '');
    }, [selectedConversation]);

    const canSendComposer = Boolean(chatPartnerEmail && composerMessage.trim() && !isSendingComposer);
    const COMPOSER_CHAR_LIMIT = 1000;

    const sendComposerMessage = async () => {
        if (!canSendComposer || !currentUser) return;
        const trimmedContent = composerMessage.trim();
        if (!trimmedContent || !chatPartnerEmail) return;

        setIsSendingComposer(true);
        setComposerError(null);

        try {
            const latest = selectedConversation.length > 0 ? selectedConversation[selectedConversation.length - 1] : null;
            const subject = composerSubject.trim() || latest?.messageSubject || undefined;
            await sendAuthenticatedUserMessage({ messageSubject: subject, messageContent: trimmedContent, recipientEmail: chatPartnerEmail });

            setComposerMessage('');
            const updatedMessages = await getMessages();
            const refreshedGroups = groupMessage(updatedMessages);
            const currentConversationId = selectedConversation[0]?.conversationId;
            const conversationGroup = currentConversationId
                ? refreshedGroups.find(group => group.conversationKey === currentConversationId)
                : undefined;

            const updatedConversation = conversationGroup?.messages ?? [];
            setSelectedConversation(updatedConversation);
            if (updatedConversation.length) setSelectedMessage(updatedConversation[updatedConversation.length - 1]);
            await getMessageCount();
        } catch (error: any) {
            setComposerError(error.message ?? 'Failed to send message. Please try again.');
        } finally {
            setIsSendingComposer(false);
        }
    };

    const handleComposerSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (canSendComposer) await sendComposerMessage();
    };

    const handleComposerKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (canSendComposer) await sendComposerMessage();
        }
    };

    const inputCls = "w-full px-3 py-2 rounded-lg border border-obsidian-border bg-obsidian-surface text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30 transition-colors text-sm";

    return (
        <form onSubmit={handleComposerSubmit} className="mt-4 border-t border-obsidian-border pt-4 space-y-2">
            {!chatPartnerEmail ? (
                <p className="text-xs text-ink-muted">Select a conversation to start responding.</p>
            ) : (
                <>
                    {composerError && (
                        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">{composerError}</div>
                    )}
                    <input
                        type="text"
                        value={composerSubject}
                        onChange={(e) => setComposerSubject(e.target.value)}
                        placeholder="Subject"
                        className={inputCls}
                    />
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <textarea
                                value={composerMessage}
                                onChange={(e) => setComposerMessage(e.target.value)}
                                onKeyDown={handleComposerKeyDown}
                                placeholder="Type a message... (Enter to send)"
                                rows={2}
                                maxLength={COMPOSER_CHAR_LIMIT}
                                className={`${inputCls} resize-none`}
                            />
                            <p className="text-xs text-ink-muted text-right mt-0.5">{composerMessage.length}/{COMPOSER_CHAR_LIMIT}</p>
                        </div>
                        <button
                            type="submit"
                            disabled={!canSendComposer}
                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 shrink-0 mb-5 ${
                                canSendComposer ? 'bg-accent-indigo hover:bg-indigo-500 text-white shadow-md' : 'bg-obsidian-surface border border-obsidian-border text-ink-muted cursor-not-allowed'
                            }`}
                        >
                            {isSendingComposer ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send size={16} />
                            )}
                        </button>
                    </div>
                </>
            )}
        </form>
    );
};

interface NewConversationModalProps {
    setShowNewConversationModal: (show: boolean) => void;
    currentUser: any;
    onConversationStarted: (message: Message) => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ setShowNewConversationModal, currentUser, onConversationStarted }) => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [messageSubject, setMessageSubject] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getMessages, getMessageCount } = usePortfolio();

    const COMPOSER_CHAR_LIMIT = 1000;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!recipientEmail.trim()) { setError('Recipient email is required'); return; }
        if (!messageContent.trim()) { setError('Message content is required'); return; }

        setIsSending(true);
        setError(null);
        try {
            const response = await sendAuthenticatedUserMessage({
                messageSubject: messageSubject.trim() || undefined,
                messageContent: messageContent.trim(),
                recipientEmail: recipientEmail.trim(),
            });
            await getMessages();
            await getMessageCount();
            onConversationStarted(response);
            setShowNewConversationModal(false);
        } catch (error: any) {
            setError(error.message || 'Failed to send message. Please check if the recipient email exists in the system.');
        } finally {
            setIsSending(false);
        }
    };

    const inputCls = "w-full px-4 py-2.5 rounded-lg border border-obsidian-border bg-obsidian-surface text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30 transition-colors text-sm";
    const labelCls = "block text-sm font-medium text-ink-secondary mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-obsidian-card border border-obsidian-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between p-5 border-b border-obsidian-border">
                    <h3 className="font-grotesk text-lg font-bold text-ink-primary">New Conversation</h3>
                    <button onClick={() => setShowNewConversationModal(false)} className="p-1.5 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}

                    <div>
                        <label className={labelCls}>Recipient Email <span className="text-red-400">*</span></label>
                        <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Enter recipient email address" className={inputCls} disabled={isSending} required />
                        <p className="mt-1 text-xs text-ink-muted">You can only message users registered in the system</p>
                    </div>

                    <div>
                        <label className={labelCls}>Subject <span className="text-ink-muted text-xs font-normal">(optional)</span></label>
                        <input type="text" value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} placeholder="Enter message subject" className={inputCls} disabled={isSending} />
                    </div>

                    <div>
                        <label className={labelCls}>Message <span className="text-red-400">*</span></label>
                        <textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Type your message..."
                            rows={5}
                            maxLength={COMPOSER_CHAR_LIMIT}
                            className={`${inputCls} resize-none`}
                            disabled={isSending}
                            required
                        />
                        <p className="text-xs text-ink-muted text-right mt-0.5">{messageContent.length}/{COMPOSER_CHAR_LIMIT}</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowNewConversationModal(false)} className="btn-ghost flex-1 py-2.5 rounded-lg text-sm" disabled={isSending}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-glow flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"
                            disabled={isSending || !recipientEmail.trim() || !messageContent.trim()}
                        >
                            {isSending ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                            ) : (
                                <><Send size={15} /> Send Message</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export { ComposeMessageForm, NewConversationModal };
