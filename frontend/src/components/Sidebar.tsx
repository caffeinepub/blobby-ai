import React, { useState } from 'react';
import { Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useListSessions, useDeleteSession } from '../hooks/useQueries';
import type { ChatSession } from '../backend';

interface SidebarProps {
    currentSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
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

export default function Sidebar({
    currentSessionId,
    onSelectSession,
    onNewChat,
    isCollapsed,
    onToggleCollapse,
}: SidebarProps) {
    const { data: sessions = [], isLoading } = useListSessions();
    const deleteSession = useDeleteSession();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        setDeletingId(sessionId);
        try {
            await deleteSession.mutateAsync(sessionId);
        } finally {
            setDeletingId(null);
        }
    };

    // Sort sessions by most recent message
    const sortedSessions = [...sessions].sort((a, b) => {
        const aTime = a.messages.length > 0 ? Number(a.messages[a.messages.length - 1].timestamp) : 0;
        const bTime = b.messages.length > 0 ? Number(b.messages[b.messages.length - 1].timestamp) : 0;
        return bTime - aTime;
    });

    return (
        <div
            className="flex flex-col h-full transition-all duration-300 border-r border-border/50"
            style={{
                width: isCollapsed ? '56px' : '260px',
                background: 'oklch(0.11 0.01 280)',
                minWidth: isCollapsed ? '56px' : '260px',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-4 border-b border-border/30">
                {!isCollapsed && (
                    <img
                        src="/assets/generated/blobby-logo.dim_320x80.png"
                        alt="Blobby AI"
                        className="h-7 object-contain"
                    />
                )}
                <button
                    onClick={onToggleCollapse}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-auto"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* New Chat button */}
            <div className="px-3 py-3">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        background: 'linear-gradient(135deg, oklch(0.52 0.22 290 / 0.2) 0%, oklch(0.42 0.18 290 / 0.15) 100%)',
                        border: '1px solid oklch(0.52 0.22 290 / 0.3)',
                        color: 'oklch(0.72 0.18 290)',
                    }}
                >
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span>New Chat</span>}
                </button>
            </div>

            {/* Sessions list */}
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
                    !isCollapsed && (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground/50">No chats yet</p>
                        </div>
                    )
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
                                    onClick={() => onSelectSession(session.id)}
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
                                    {!isCollapsed && (
                                        <>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate text-foreground/80">
                                                    {title}
                                                </p>
                                                {time && (
                                                    <p className="text-xs text-muted-foreground/50 mt-0.5">{time}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(e, session.id)}
                                                disabled={deletingId === session.id}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div className="px-4 py-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground/30 text-center">Built by Talha bin Saif</p>
                </div>
            )}
        </div>
    );
}
