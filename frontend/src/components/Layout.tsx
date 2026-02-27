import React, { useState } from 'react';
import { Settings, User, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import PreviewPanel from './PreviewPanel';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface LayoutProps {
    userProfile: { name: string } | null;
}

export default function Layout({ userProfile }: LayoutProps) {
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const { identity, clear } = useInternetIdentity();
    const queryClient = useQueryClient();

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setPreviewOpen(false);
        setPreviewHtml(null);
        setPreviewImage(null);
    };

    const handleSelectSession = (sessionId: string) => {
        setCurrentSessionId(sessionId);
        setPreviewOpen(false);
        setPreviewHtml(null);
        setPreviewImage(null);
    };

    const handleSessionCreated = (sessionId: string) => {
        setCurrentSessionId(sessionId);
    };

    const handlePreviewHtml = (html: string) => {
        setPreviewHtml(html);
        setPreviewImage(null);
        setPreviewOpen(true);
    };

    const handlePreviewImage = (url: string) => {
        setPreviewImage(url);
        setPreviewHtml(null);
        setPreviewOpen(true);
    };

    const handleLogout = async () => {
        await clear();
        queryClient.clear();
        setShowUserMenu(false);
    };

    const displayName = userProfile?.name || identity?.getPrincipal().toString().slice(0, 8) + '...' || 'User';

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Top bar */}
            <header
                className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0 z-10"
                style={{ background: 'oklch(0.11 0.01 280)' }}
            >
                <div className="flex items-center gap-3">
                    <img
                        src="/assets/generated/blobby-logo.dim_320x80.png"
                        alt="Blobby AI"
                        className="h-8 object-contain"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(v => !v)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                                style={{
                                    background: 'oklch(0.52 0.22 290 / 0.2)',
                                    color: 'oklch(0.72 0.18 290)',
                                }}
                            >
                                {displayName[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="hidden sm:block max-w-24 truncate">{displayName}</span>
                        </button>

                        {showUserMenu && (
                            <div
                                className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border/50 shadow-lg z-50 overflow-hidden"
                                style={{ background: 'oklch(0.16 0.015 280)' }}
                            >
                                <div className="px-3 py-2 border-b border-border/30">
                                    <p className="text-xs text-muted-foreground">Signed in as</p>
                                    <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    currentSessionId={currentSessionId}
                    onSelectSession={handleSelectSession}
                    onNewChat={handleNewChat}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(v => !v)}
                />

                {/* Chat window */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <ChatWindow
                        sessionId={currentSessionId}
                        onSessionCreated={handleSessionCreated}
                        onPreviewHtml={handlePreviewHtml}
                        onPreviewImage={handlePreviewImage}
                    />
                </main>

                {/* Preview panel */}
                {previewOpen && (
                    <div className="w-96 flex-shrink-0 flex flex-col overflow-hidden">
                        <PreviewPanel
                            htmlContent={previewHtml}
                            imageUrl={previewImage}
                            isOpen={previewOpen}
                            onClose={() => setPreviewOpen(false)}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer
                className="flex items-center justify-center gap-4 px-4 py-2 border-t border-border/30 flex-shrink-0"
                style={{ background: 'oklch(0.11 0.01 280)' }}
            >
                <p className="text-xs text-muted-foreground/30">
                    Built by Talha bin Saif
                </p>
                <span className="text-muted-foreground/20 text-xs">·</span>
                <p className="text-xs text-muted-foreground/25">
                    Built with ❤️ using{' '}
                    <a
                        href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'blobby-ai')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-muted-foreground/50 transition-colors"
                    >
                        caffeine.ai
                    </a>
                </p>
            </footer>

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                />
            )}
        </div>
    );
}
