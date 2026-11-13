import { Mail, Bell, Search, Trash2, Check, ChevronLeft, ChevronRight, Clock, MessageSquare, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePortfolio } from "../../context/PortfolioContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Message } from "../../services/modal";
import { markMessagesAsRead } from "../../services/api";
import { getWsBaseUrl } from "../../config/env.config";
import { ModalOverlay } from "../forms/ModalOverlay";
import DeleteConfirmationModal from "../forms/DeleteConfirmationModal";
import { formatDate, normalizeMessage, groupMessage, getConversationMessages } from "../utils/ContactManagementUtils";
import { ComposeMessageForm, NewConversationModal } from "../forms/ContactManagementForm";

type FilterType = 'all' | 'unread';

const MESSAGES_PER_PAGE = 5;

const ContactManagement = () => {
    const { isAuthenticated, currentUser } = useAuth();
    const { 
        messages, setMessages, messageCount, 
        getMessageCount, isMessageLoading, getMessages
    } = usePortfolio();
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<Message[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [readingMessageIds, setReadingMessageIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [showDeleteConfirmationModalForSingleMessage, setShowDeleteConfirmationModalForSingleMessage] = useState(false);
    const [showDeleteConfirmationModalForConversation, setShowDeleteConfirmationModalForConversation] = useState(false);
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    const previousConversationKeyRef = useRef<string>('');
    const conversationContainerRef = useRef<HTMLDivElement | null>(null);
    const shouldScrollToBottomRef = useRef<boolean>(false);
    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const messageObservers = useRef<Map<string, IntersectionObserver>>(new Map());
    const processingMessagesRef = useRef<Set<string>>(new Set());
    const pendingReadIdsRef = useRef<Set<string>>(new Set());
    const processedReadIdsRef = useRef<Set<string>>(new Set());
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const normalizedMessages = useMemo(() => messages.map(normalizeMessage).filter((m): m is Message => m !== null), [messages]);
    const filteredMessages = useMemo(() => {
        let collection = normalizedMessages;

        if (filter === 'unread') {
            collection = collection.filter((msg) => !((msg as any).isRead ?? (msg as any).read ?? false));
        }

        if (searchTerm) {
            const lowered = searchTerm.toLowerCase();
            collection = collection.filter((msg) =>
                (msg.senderName ?? '').toLowerCase().includes(lowered) ||
                (msg.senderEmail ?? '').toLowerCase().includes(lowered) ||
                (msg.messageSubject ?? '').toLowerCase().includes(lowered) ||
                msg.messageContent.toLowerCase().includes(lowered)
            );
        }

        return collection;
    }, [normalizedMessages, filter, searchTerm]);

    const groupedMessages = useMemo(() => groupMessage(filteredMessages), [filteredMessages]);
    const totalPages = useMemo(() => Math.max(1, Math.ceil(groupedMessages.length / MESSAGES_PER_PAGE)), [groupedMessages.length]);
    const clampedPage = Math.min(currentPage, totalPages);
    useEffect(() => {
        if (clampedPage !== currentPage) {
            setCurrentPage(clampedPage);
        }
    }, [clampedPage, currentPage]);
    const startIndex = (clampedPage - 1) * MESSAGES_PER_PAGE;
    const endIndex = Math.min(startIndex + MESSAGES_PER_PAGE, groupedMessages.length);
    const paginatedGroups = useMemo(
        () => groupedMessages.slice(startIndex, endIndex),
        [groupedMessages, startIndex, endIndex]
    );

    const conversationKey = useMemo(() => {
        if (!selectedConversation || selectedConversation.length === 0) {
            return '';
        }
        // Use conversationId (required field)
        const firstMessage = selectedConversation[0];
        return firstMessage?.conversationId || '';
    }, [selectedConversation]);

    useEffect(() => {
        if (!conversationKey) {
            previousConversationKeyRef.current = '';
            return;
        }

        if (previousConversationKeyRef.current !== conversationKey && selectedConversation && selectedConversation.length > 0) {
            previousConversationKeyRef.current = conversationKey;
        }
    }, [conversationKey, selectedConversation]);

    const chatPartnerEmail = useMemo(() => {
        if (!selectedConversation || !selectedConversation.length) {
            return '';
        }

        const myEmail = currentUser?.email;
        for (let index = selectedConversation.length - 1; index >= 0; index -= 1) {
            const message = selectedConversation[index];
            if (message.senderEmail && message.senderEmail !== myEmail) {
                return message.senderEmail;
            }
            if (message.recipientEmail && message.recipientEmail !== myEmail) {
                return message.recipientEmail;
            }
        }

        const fallback = selectedConversation[0];
        if (!fallback) {
            return '';
        }

        if (fallback.senderEmail && fallback.senderEmail !== myEmail) {
            return fallback.senderEmail;
        }

        if (fallback.recipientEmail && fallback.recipientEmail !== myEmail) {
            return fallback.recipientEmail;
        }

        return fallback.recipientEmail || fallback.senderEmail || '';
    }, [selectedConversation, currentUser?.email]);

    const chatPartnerName = useMemo(() => {
        if (!selectedConversation || !selectedConversation.length) {
            return '';
        }

        const myEmail = currentUser?.email?.toLowerCase();
        let partnerName = '';
        let partnerEmail = '';

        // Find partner's name and email from messages (prioritize most recent)
        for (let index = selectedConversation.length - 1; index >= 0; index -= 1) {
            const message = selectedConversation[index];
            const senderEmailLower = message.senderEmail?.toLowerCase();
            const recipientEmailLower = message.recipientEmail?.toLowerCase();
            
            // Partner is the sender
            if (senderEmailLower && senderEmailLower !== myEmail && message.senderEmail) {
                partnerEmail = message.senderEmail || '';
                // Prioritize senderName if available and not empty
                if (message.senderName && message.senderName.trim()) {
                    partnerName = message.senderName.trim();
                    break; // Found name, stop searching
                }
                if (!partnerName) {
                    partnerName = message.senderName || ''; // Keep empty if no name, will use email
                }
            }
            
            // Partner is the recipient
            if (recipientEmailLower && recipientEmailLower !== myEmail && message.recipientEmail) {
                partnerEmail = message.recipientEmail || '';
                // Prioritize recipientName if available and not empty
                if (message.recipientName && message.recipientName.trim()) {
                    partnerName = message.recipientName.trim();
                    break; // Found name, stop searching
                }
                if (!partnerName) {
                    partnerName = message.recipientName || ''; // Keep empty if no name, will use email
                }
            }
        }

        // Return name if available, otherwise extract a display name from email
        if (partnerName && partnerName.trim()) {
            return partnerName;
        }
        
        // If no name found, extract a display name from email (e.g., "test1" from "test1@gmail.com")
        if (partnerEmail && partnerEmail.trim()) {
            const emailName = partnerEmail.split('@')[0];
            // Capitalize first letter for better display
            return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }

        return '';
    }, [selectedConversation, currentUser?.email]);

    useEffect(() => {
        const conversation = getConversationMessages(groupedMessages, selectedMessage);
        setSelectedConversation(conversation || []);
    }, [groupedMessages, selectedMessage]);

    const handleMessageViewed = useCallback((message: Message) => {
        const messageId = (message as any)._id ?? (message as any).id;
        if (!messageId) {
            return;
        }

        const isSentByMe = message.senderUserId && currentUser?.id ? message.senderUserId === currentUser.id : false;
        const isAlreadyRead = (message as any).isRead ?? (message as any).read ?? false;

        if (isSentByMe || isAlreadyRead || processingMessagesRef.current.has(messageId) || processedReadIdsRef.current.has(messageId)) {
            return;
        }

        processingMessagesRef.current.add(messageId);
        pendingReadIdsRef.current.add(messageId);
        setReadingMessageIds((prev) => (prev.includes(messageId) ? prev : [...prev, messageId]));
    }, [currentUser?.id]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const pendingIds = Array.from(pendingReadIdsRef.current);
            if (pendingIds.length === 0) {
                return;
            }

            let idSet: Set<string> | null = null;
            try {
                await markMessagesAsRead(pendingIds);

                idSet = new Set(pendingIds);
                setMessages((prev) => prev.map((msg) => {
                    const msgId = (msg as any)._id ?? (msg as any).id;
                    if (msgId && idSet?.has(msgId)) {
                        return { ...msg, isRead: true, read: true };
                    }
                    return msg;
                }));
                setSelectedConversation((prev) => prev.map((msg) => {
                    const msgId = (msg as any)._id ?? (msg as any).id;
                    if (msgId && idSet?.has(msgId)) {
                        return { ...msg, isRead: true, read: true };
                    }
                    return msg;
                }));
                await getMessageCount();
                pendingIds.forEach((id) => {
                    processingMessagesRef.current.delete(id);
                    processedReadIdsRef.current.add(id);
                });
                pendingReadIdsRef.current.clear();
                setReadingMessageIds((prev) => prev.filter((id) => !idSet?.has(id)));
                shouldScrollToBottomRef.current = true;
            } catch (error) {
                console.error('Failed to mark messages as read', error);
                pendingIds.forEach((id) => {
                    processingMessagesRef.current.delete(id);
                    processedReadIdsRef.current.delete(id);
                });
                if (idSet) {
                    setReadingMessageIds((prev) => prev.filter((id) => !idSet || !idSet.has(id)));
                } else {
                    setReadingMessageIds((prev) => prev.filter((id) => !pendingIds.includes(id)));
                }
                // leave ids in pending to retry next tick
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [getMessageCount, setMessages]);

    useEffect(() => {
        const observers = messageObservers.current;
        observers.forEach((observer) => observer.disconnect());
        observers.clear();

        if (!conversationContainerRef.current) {
            return;
        }

        selectedConversation.forEach((message) => {
            const messageId = (message as any)._id ?? (message as any).id;
            if (!messageId) {
                return;
            }
            const isAlreadyRead = (message as any).isRead ?? (message as any).read ?? false;
            if (isAlreadyRead) {
                return;
            }

            const element = messageRefs.current.get(messageId);
            if (!element) {
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                        handleMessageViewed(message);
                        observer.disconnect();
                        observers.delete(messageId);
                    }
                });
            }, {
                root: conversationContainerRef.current,
                threshold: [0.6]
            });

            observer.observe(element);
            observers.set(messageId, observer);
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
            observers.clear();
        };
    }, [handleMessageViewed, selectedConversation]);

    const handleSocketMessage = useCallback((event: MessageEvent) => {
        try {
            const envelope = JSON.parse(event.data);
            const eventType = envelope?.event;
            const payload = envelope?.payload;

            if (eventType === 'message:new' && payload) {
                const normalized = normalizeMessage(payload);
                if (!normalized) return;
                const normalizedId = (normalized as any)._id ?? (normalized as any).id;

                setMessages((prev: Message[]) => {
                    if (!normalizedId) {
                        return prev;
                    }

                    const exists = prev.some((msg) => {
                        const msgId = (msg as any)._id ?? (msg as any).id;
                        return msgId === normalizedId;
                    });

                    if (exists) {
                        return prev.map((msg) => {
                            const msgId = (msg as any)._id ?? (msg as any).id;
                            return msgId === normalizedId ? { ...msg, ...normalized } : msg;
                        });
                    }

                    return [...prev, normalized];
                });

                setSelectedConversation((prev) => {
                    if (!prev.length) {
                        return prev;
                    }

                    // Match by conversationId (required field)
                    const shouldAddToConversation = normalized.conversationId && conversationKey && normalized.conversationId === conversationKey;
                    
                    if (shouldAddToConversation) {
                        const existsInConversation = prev.some((msg) => {
                            const msgId = (msg as any)._id ?? (msg as any).id;
                            return msgId === normalizedId;
                        });
                        if (existsInConversation) {
                            return prev.map((msg) => {
                                const msgId = (msg as any)._id ?? (msg as any).id;
                                return msgId === normalizedId ? { ...msg, ...normalized } : msg;
                            });
                        }
                        shouldScrollToBottomRef.current = true;
                        return [...prev, normalized];
                    }
                    return prev;
                });

                const root = conversationContainerRef.current;
                if (root && normalized.recipientUserId && currentUser?.id && normalized.recipientUserId === currentUser.id) {
                    shouldScrollToBottomRef.current = true;
                }

                if (normalized.recipientUserId && currentUser?.id && normalized.recipientUserId === currentUser.id) {
                    getMessageCount();
                }
            }

            if (eventType === 'message:read' && payload?.messageIds) {
                const ids: string[] = (payload.messageIds as string[]).map(String);
                const idSet = new Set(ids);

                if (ids.length === 0) {
                    return;
                }

                setMessages((prev: Message[]) => prev.map((msg) => {
                    const msgId = (msg as any)._id ?? (msg as any).id;
                    if (msgId && idSet.has(msgId)) {
                        return { ...msg, isRead: true, read: true };
                    }
                    return msg;
                }));

                setSelectedConversation((prev) => prev.map((msg) => {
                    const msgId = (msg as any)._id ?? (msg as any).id;
                    if (msgId && idSet.has(msgId)) {
                        return { ...msg, isRead: true, read: true };
                    }
                    return msg;
                }));

                getMessageCount();
            }
        } catch (error) {
            console.error('Failed to handle websocket message', error);
        }
    }, [conversationKey, currentUser?.id, getMessageCount, setMessages]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            return;
        }

        let shouldReconnect = true;

        const connect = () => {
            const baseUrl = getWsBaseUrl().replace(/\/$/, '');
            const socketUrl = `${baseUrl}/ws/messages?token=${token}`;
            const ws = new WebSocket(socketUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setSocketConnected(true);
            };

            ws.onmessage = handleSocketMessage;

            ws.onclose = () => {
                setSocketConnected(false);
                if (shouldReconnect) {
                    reconnectTimeoutRef.current = setTimeout(connect, 3000);
                }
            };

            ws.onerror = () => {
                ws.close();
            };
        };

        connect();

        return () => {
            shouldReconnect = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [handleSocketMessage, isAuthenticated]);

    useEffect(() => {
        document.title = 'Contact Management';
    }, []);

    // Scroll to top functionality
    const scrollToTop = () => {
        const messageList = document.querySelector('.message-list-container');
        if (messageList) {
            messageList.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle scroll events for scroll-to-top button
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        setShowScrollToTop(target.scrollTop > 100);
    };

    useEffect(() => {
        const container = conversationContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [selectedConversation, selectedMessage]);

    useEffect(() => {
        if (!shouldScrollToBottomRef.current) {
            return;
        }

        shouldScrollToBottomRef.current = false;
        const container = conversationContainerRef.current;
        if (container) {
            requestAnimationFrame(() => {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            });
        }
    }, [selectedConversation, readingMessageIds]);

    if (!isAuthenticated) {
        return null;
    }
    
    return (
        <section id="contact-management" className="section-obsidian py-20">
            {showDeleteConfirmationModalForSingleMessage && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModalForSingleMessage(false)}>
                    <DeleteConfirmationModal
                        setShowDeleteModal={setShowDeleteConfirmationModalForSingleMessage}
                        data={selectedMessage as Message}
                        dataType="message"
                        setSelectedData={setSelectedMessage}
                    />
                </ModalOverlay>
            )}

            {showDeleteConfirmationModalForConversation && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModalForConversation(false)}>
                    <DeleteConfirmationModal
                        setShowDeleteModal={setShowDeleteConfirmationModalForConversation}
                        data={selectedConversation}
                        dataType="conversation"
                        setSelectedData={(data) => setSelectedConversation(data || [])}
                    />
                </ModalOverlay>
            )}

            {showNewConversationModal && (
                <NewConversationModal
                    setShowNewConversationModal={setShowNewConversationModal}
                    currentUser={currentUser}
                    onConversationStarted={async (newMessage: Message) => {
                        const updatedMessages = await getMessages();
                        const normalizedMessages = updatedMessages.map(normalizeMessage).filter((m): m is Message => m !== null);
                        const refreshedGroups = groupMessage(normalizedMessages);
                        const conversationGroup = refreshedGroups.find(group =>
                            group.conversationKey === newMessage.conversationId
                        );
                        if (conversationGroup && conversationGroup.messages.length > 0) {
                            setSelectedMessage(conversationGroup.latestMessage);
                            setSelectedConversation(conversationGroup.messages);
                        }
                    }}
                />
            )}

            <div className="container mx-auto px-4 lg:px-8">
                <div className="mb-10">
                    <h2 className="font-grotesk text-4xl font-bold text-ink-primary">Messages</h2>
                    <p className="text-ink-secondary mt-1 text-sm">Manage your conversations and inquiries</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <div className="obs-card p-5 flex items-center gap-4">
                        <div className="p-3 bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl shrink-0">
                            <Mail className="w-6 h-6 text-accent-indigo" />
                        </div>
                        <div>
                            <p className="text-ink-muted text-xs font-medium uppercase tracking-wide mb-1">Total Messages</p>
                            <p className="text-ink-primary text-3xl font-bold font-grotesk">{messageCount.total}</p>
                        </div>
                    </div>

                    <div className="obs-card p-5 flex items-center gap-4">
                        <div className="relative p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
                            <Mail className="w-6 h-6 text-emerald-400" />
                            {messageCount.unread > 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">{messageCount.unread > 9 ? '9+' : messageCount.unread}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-ink-muted text-xs font-medium uppercase tracking-wide mb-1">Unread</p>
                            <p className="text-ink-primary text-3xl font-bold font-grotesk">{messageCount.unread}</p>
                        </div>
                    </div>

                    <div className="obs-card p-5 flex items-center gap-4">
                        <div className="p-3 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl shrink-0">
                            <Check className="w-6 h-6 text-accent-cyan" />
                        </div>
                        <div>
                            <p className="text-ink-muted text-xs font-medium uppercase tracking-wide mb-1">Read</p>
                            <p className="text-ink-primary text-3xl font-bold font-grotesk">{messageCount.read}</p>
                        </div>
                    </div>
                </div>

                {/* Messages Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Messages List */}
                    <div className="lg:col-span-1">
                        <div className="obs-card p-5 h-[600px] flex flex-col">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-grotesk text-lg font-bold text-ink-primary">Messages</h3>
                                    <button
                                        onClick={() => setShowNewConversationModal(true)}
                                        className="btn-glow flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                                        title="Start new conversation"
                                    >
                                        <Send size={13} />
                                        New
                                    </button>
                                </div>
                                <p className="text-ink-muted text-xs">{groupedMessages.length} conversation{groupedMessages.length !== 1 ? 's' : ''} · {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}</p>
                            </div>

                            {/* Search Input */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search messages"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-obsidian-surface text-ink-primary placeholder-ink-muted rounded-lg border border-obsidian-border focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30 text-sm transition-colors"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex gap-2 mb-4">
                                {(['all', 'unread'] as const).map((filterType) => (
                                    <button
                                        key={filterType}
                                        onClick={() => setFilter(filterType)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                                            filterType === filter
                                                ? 'bg-accent-indigo/15 text-accent-indigo border-accent-indigo/40'
                                                : 'bg-obsidian-surface text-ink-muted border-obsidian-border hover:border-accent-indigo/30 hover:text-ink-secondary'
                                        }`}
                                    >
                                        {filterType === 'all' && <Mail className="w-3 h-3" />}
                                        {filterType === 'unread' && <Bell className="w-3 h-3" />}
                                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Message List */}
                            <div
                                className="space-y-2 flex-1 overflow-y-auto mb-3 scrollbar-thin scroll-smooth message-list-container"
                                onScroll={handleScroll}
                            >
                                {isMessageLoading ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 border-2 border-obsidian-border border-t-accent-indigo rounded-full mx-auto mb-3 animate-spin"></div>
                                        <p className="text-ink-muted text-sm">Loading conversations...</p>
                                    </div>
                                ) : paginatedGroups.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-indigo/10 border border-accent-indigo/20 rounded-2xl mb-4">
                                            <Mail className="w-7 h-7 text-accent-indigo/50" />
                                        </div>
                                        <p className="text-ink-secondary font-medium mb-1 text-sm">No conversations found</p>
                                        <p className="text-ink-muted text-xs">Try adjusting your filters or search</p>
                                    </div>
                                ) : (
                                    paginatedGroups.map((group) => {
                                        const isActive = selectedMessage?.conversationId === group.conversationKey;
                                        const partnerEmail = group.senderEmail === currentUser?.email ? group.recipientEmail : group.senderEmail;
                                        const partnerName = group.senderEmail === currentUser?.email ? group.recipientName || '' : group.sender || '';
                                        const displayName = partnerName?.trim() || partnerEmail;
                                        const initials = (text?: string) => {
                                            if (!text) return 'U';
                                            const parts = text.trim().split(' ').filter(Boolean);
                                            if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
                                            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                                        };

                                        return (
                                            <div
                                                key={group.conversationKey}
                                                onClick={() => setSelectedMessage(group.latestMessage)}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer transition-all duration-200 border ${
                                                    isActive
                                                        ? 'bg-accent-indigo/10 border-accent-indigo/40'
                                                        : 'bg-obsidian-surface border-obsidian-border hover:border-accent-indigo/25 hover:bg-accent-indigo/5'
                                                }`}
                                            >
                                                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent-indigo/15 border border-accent-indigo/25 text-sm font-semibold uppercase text-accent-indigo">
                                                    {initials(displayName || partnerEmail || undefined)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="text-ink-primary font-medium text-sm truncate">{displayName}</p>
                                                            {partnerName && partnerEmail && partnerName.trim().length > 0 && partnerName !== partnerEmail && (
                                                                <p className="text-ink-muted text-xs truncate">{partnerEmail}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                                            <span className="text-xs text-ink-muted">{formatDate(group.latestMessage.created_at)}</span>
                                                            {group.unreadCount > 0 && (
                                                                <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-accent-indigo px-1.5 text-[10px] font-bold text-white">
                                                                    {group.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-3 border-t border-obsidian-border mt-auto">
                                    <span className="text-ink-muted text-xs">{startIndex + 1}–{Math.min(endIndex, groupedMessages.length)} of {groupedMessages.length}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`p-1.5 rounded-lg transition-colors ${currentPage === 1 ? 'text-ink-muted/30 cursor-not-allowed' : 'text-ink-muted hover:text-ink-primary hover:bg-obsidian-border'}`}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-ink-secondary text-xs px-2">{currentPage} / {totalPages}</span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={`p-1.5 rounded-lg transition-colors ${currentPage === totalPages ? 'text-ink-muted/30 cursor-not-allowed' : 'text-ink-muted hover:text-ink-primary hover:bg-obsidian-border'}`}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {showScrollToTop && (
                            <button
                                onClick={scrollToTop}
                                className="absolute bottom-20 right-4 w-9 h-9 bg-obsidian-card border border-obsidian-border rounded-full flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors shadow-lg z-10"
                            >
                                <ChevronLeft size={18} className="rotate-90" />
                            </button>
                        )}
                    </div>

                    {/* Message Detail */}
                    <div className="lg:col-span-2">
                        <div className="obs-card p-5 h-[600px] flex flex-col">
                            {selectedMessage ? (
                                <>
                                    <div className="flex justify-between items-start mb-5 pb-4 border-b border-obsidian-border">
                                        <div>
                                            <h3 className="font-grotesk text-lg font-bold text-ink-primary">Conversation</h3>
                                            <p className="text-ink-muted text-xs mt-0.5">{chatPartnerName} · {selectedConversation.length} message{selectedConversation.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteConfirmationModalForConversation(true)}
                                            className="p-2 text-ink-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete conversation"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div
                                        ref={conversationContainerRef}
                                        className="space-y-4 flex-1 overflow-y-auto scrollbar-thin scroll-smooth pr-1"
                                    >
                                        {selectedConversation.map((message, index) => {
                                            const isSentByMe = message.senderUserId && currentUser?.id ? message.senderUserId === currentUser.id : false;
                                            const isActive = selectedMessage?._id === message._id;
                                            const fullDateTooltip = message.created_at ? (() => {
                                                try {
                                                    const date = new Date(message.created_at);
                                                    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
                                                } catch { return 'Invalid date'; }
                                            })() : 'No date available';

                                            const initials = (text?: string, fallback?: string) => {
                                                const base = (text && text.trim()) || fallback || '';
                                                if (!base) return 'U';
                                                const parts = base.split(' ').filter(Boolean);
                                                if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
                                                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                                            };

                                            const messageKey = message._id ?? `${message.senderEmail ?? 'unknown'}-${message.recipientEmail ?? 'unknown'}-${message.created_at ?? index}`;

                                            return (
                                                <div key={messageKey} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`flex max-w-[80%] items-end gap-2.5 ${isSentByMe ? 'flex-row-reverse' : ''}`}>
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-indigo/15 border border-accent-indigo/25 text-xs font-semibold uppercase text-accent-indigo shrink-0">
                                                            {initials(
                                                                isSentByMe ? (currentUser?.first_name || currentUser?.email || '') : message.senderName,
                                                                isSentByMe ? currentUser?.email : message.senderEmail
                                                            )}
                                                        </div>

                                                        <div
                                                            onClick={() => setSelectedMessage(message)}
                                                            ref={(el) => {
                                                                const messageIdRef = (message as any)._id ?? (message as any).id;
                                                                if (!messageIdRef) return;
                                                                if (el) messageRefs.current.set(messageIdRef, el);
                                                                else messageRefs.current.delete(messageIdRef);
                                                            }}
                                                            className={[
                                                                'relative flex cursor-pointer flex-col gap-2 rounded-2xl px-4 py-3 transition-all duration-200',
                                                                isSentByMe
                                                                    ? 'rounded-br-sm bg-accent-indigo text-white'
                                                                    : 'rounded-bl-sm bg-obsidian-surface border border-obsidian-border text-ink-primary',
                                                                isActive
                                                                    ? 'ring-2 ring-accent-indigo/60'
                                                                    : 'hover:ring-1 hover:ring-accent-indigo/30',
                                                            ].join(' ')}
                                                        >
                                                            <div className={`flex items-start gap-3 ${isSentByMe ? 'justify-end' : 'justify-between'}`}>
                                                                <p className={`text-xs font-semibold uppercase tracking-wide ${isSentByMe ? 'text-white/70 text-right' : 'text-ink-muted text-left'}`}>
                                                                    {message.messageSubject || 'No Subject'}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    {readingMessageIds.includes(((message as any)._id ?? (message as any).id) ?? '') ? (
                                                                        <div className="flex items-center gap-1 rounded-full bg-accent-indigo/20 px-2 py-0.5">
                                                                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-indigo"></div>
                                                                            <span className="text-xs font-medium text-accent-indigo">Reading…</span>
                                                                        </div>
                                                                    ) : !((message as any).isRead ?? (message as any).read ?? false) ? (
                                                                        <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5">
                                                                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></div>
                                                                            <span className="text-xs font-medium text-emerald-400">New</span>
                                                                        </div>
                                                                    ) : isSentByMe ? (
                                                                        <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                                                                            <Check className="h-3 w-3" /><span>Read</span>
                                                                        </div>
                                                                    ) : null}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirmationModalForSingleMessage(true); setSelectedMessage(message); }}
                                                                        className={`rounded-lg p-1.5 transition-colors ${isSentByMe ? 'text-white/50 hover:text-red-300 hover:bg-white/10' : 'text-ink-muted hover:text-red-400 hover:bg-red-500/10'}`}
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isSentByMe ? 'text-white/90' : 'text-ink-secondary'}`}>
                                                                {message.messageContent}
                                                            </div>
                                                            <div className={`flex items-center gap-1.5 text-xs ${isSentByMe ? 'justify-end text-white/50' : 'text-ink-muted'}`}>
                                                                <span title={fullDateTooltip} className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {formatDate(message.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {(() => {
                                        const bothUsersAreRegistered = selectedConversation.some((message) => message.senderUserId && message.recipientUserId);
                                        if (!bothUsersAreRegistered && chatPartnerEmail) {
                                            return (
                                                <div className="mt-4 rounded-xl border border-obsidian-border bg-obsidian-surface p-4">
                                                    <p className="text-xs text-ink-muted text-center">
                                                        This message was sent by an unauthenticated user. You cannot reply because the sender is not registered in the system.
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return (
                                            <ComposeMessageForm
                                                selectedConversation={selectedConversation}
                                                setSelectedConversation={setSelectedConversation}
                                                setSelectedMessage={setSelectedMessage}
                                                currentUser={currentUser}
                                                chatPartnerEmail={chatPartnerEmail}
                                            />
                                        );
                                    })()}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-indigo/10 border border-accent-indigo/20 rounded-2xl mb-5">
                                            <MessageSquare className="w-8 h-8 text-accent-indigo/50" />
                                        </div>
                                        <h3 className="font-grotesk text-ink-primary font-bold mb-2">No Conversation Selected</h3>
                                        <p className="text-ink-muted text-sm">Choose a conversation from the list to view messages</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactManagement;