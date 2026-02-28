import React from 'react';
import { X, Plus, Trash2, MessageSquare } from 'lucide-react';
import { useListSessions, useDeleteSession } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import type { ChatSession } from '../backend';

interface SidebarDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    userProfile: { name: string } | null;
}

function formatTimestamp(timestamp: bigint): string {
    const ms = Number(timestamp) / 1_000_000;
    const date = new Date(ms);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

function getSessionTitle(session: ChatSession): string {
    const firstUserMsg = session.messages.find(m => m.role === 'user');
    if (firstUserMsg) {
        return firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '');
    }
    return 'New Chat';
}

export default function SidebarDrawer({
    isOpen,
    onClose,
    currentSessionId,
    onSelectSession,
    onNewChat,
    userProfile,
}: SidebarDrawerProps) {
    const { data: sessions = [], isLoading } = useListSessions();
    const deleteSession = useDeleteSession();
    const { identity, clear } = useInternetIdentity();
    const queryClient = useQueryClient();
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    const displayName = userProfile?.name || identity?.getPrincipal().toString().slice(0, 8) + '...' || 'User';

    const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        setDeletingId(sessionId);
        try {
            await deleteSession.mutateAsync(sessionId);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSelectSession = (sessionId: string) => {
        onSelectSession(sessionId);
        onClose();
    };

    const handleNewChat = () => {
        onNewChat();
        onClose();
    };

    const handleLogout = async () => {
        await clear();
        queryClient.clear();
        onClose();
    };

    const sortedSessions = [...sessions].sort((a, b) => {
        const aTime = a.messages.length > 0 ? Number(a.messages[a.messages.length - 1].timestamp) : 0;
        const bTime = b.messages.length > 0 ? Number(b.messages[b.messages.length - 1].timestamp) : 0;
        return bTime - aTime;
    });

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-30 transition-opacity duration-300"
                style={{
                    background: 'rgba(0,0,0,0.6)',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className="fixed top-0 left-0 h-full z-40 flex flex-col"
                style={{
                    width: '280px',
                    background: 'oklch(0.10 0.01 280)',
                    borderRight: '1px solid oklch(0.20 0.015 280)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'transform',
                }}
            >
                {/* Drawer Header */}
                <div
                    className="flex items-center justify-between px-4 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid oklch(0.18 0.015 280)' }}
                >
                    <img
                        src="/assets/generated/blobby-logo.dim_320x80.png"
                        alt="Blobby AI"
                        className="h-7 object-contain"
                    />
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-3 py-3 flex-shrink-0">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, oklch(0.52 0.22 290 / 0.2) 0%, oklch(0.42 0.18 290 / 0.15) 100%)',
                            border: '1px solid oklch(0.52 0.22 290 / 0.35)',
                            color: 'oklch(0.72 0.18 290)',
                        }}
                    >
                        <Plus className="w-4 h-4 flex-shrink-0" />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
                    {isLoading ? (
                        <div className="flex flex-col gap-2 px-1 py-2">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="h-12 rounded-lg animate-pulse"
                                    style={{ background: 'oklch(0.16 0.015 280)' }}
                                />
                            ))}
                        </div>
                    ) : sortedSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <MessageSquare className="w-8 h-8 mb-2" style={{ color: 'oklch(0.4 0.02 280)' }} />
                            <p className="text-xs" style={{ color: 'oklch(0.45 0.02 280)' }}>No chats yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 py-1">
                            {sortedSessions.map(session => {
                                const isActive = session.id === currentSessionId;
                                const title = getSessionTitle(session);
                                const lastMsg = session.messages[session.messages.length - 1];
                                const time = lastMsg ? formatTimestamp(lastMsg.timestamp) : '';

                                return (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSelectSession(session.id)}
                                        className="group relative flex items-center gap-2 px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                                        style={{
                                            background: isActive
                                                ? 'oklch(0.52 0.22 290 / 0.15)'
                                                : 'transparent',
                                            border: isActive
                                                ? '1px solid oklch(0.52 0.22 290 / 0.25)'
                                                : '1px solid transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                (e.currentTarget as HTMLElement).style.background = 'oklch(0.16 0.015 280)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        <MessageSquare
                                            className="w-4 h-4 flex-shrink-0"
                                            style={{ color: isActive ? 'oklch(0.72 0.18 290)' : 'oklch(0.5 0.02 280)' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate" style={{ color: 'oklch(0.85 0.01 280)' }}>
                                                {title}
                                            </p>
                                            {time && (
                                                <p className="text-xs mt-0.5" style={{ color: 'oklch(0.45 0.02 280)' }}>{time}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, session.id)}
                                            disabled={deletingId === session.id}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer: User info + logout */}
                <div
                    className="px-4 py-4 flex-shrink-0"
                    style={{ borderTop: '1px solid oklch(0.18 0.015 280)' }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            style={{
                                background: 'oklch(0.52 0.22 290 / 0.2)',
                                color: 'oklch(0.72 0.18 290)',
                            }}
                        >
                            {displayName[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium truncate" style={{ color: 'oklch(0.85 0.01 280)' }}>
                            {displayName}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-accent"
                        style={{ color: 'oklch(0.55 0.02 280)' }}
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                    <p className="text-xs text-center mt-3" style={{ color: 'oklch(0.35 0.01 280)' }}>
                        Built with ❤️ using{' '}
                        <a
                            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'blobby-ai')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: 'oklch(0.45 0.02 280)' }}
                        >
                            caffeine.ai
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
