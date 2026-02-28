import React, { useState } from 'react';
import TopBar from './TopBar';
import SidebarDrawer from './SidebarDrawer';
import ChatWindow from './ChatWindow';
import PreviewModal from './PreviewModal';

interface LayoutProps {
    userProfile: { name: string } | null;
}

export default function Layout({ userProfile }: LayoutProps) {
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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

    return (
        <div
            className="flex flex-col h-screen overflow-hidden"
            style={{ background: '#0D0D0D' }}
        >
            {/* Top Navigation Bar */}
            <TopBar onMenuToggle={() => setIsDrawerOpen(v => !v)} />

            {/* Slide-in Sidebar Drawer */}
            <SidebarDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                currentSessionId={currentSessionId}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                userProfile={userProfile}
            />

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <ChatWindow
                    sessionId={currentSessionId}
                    onSessionCreated={handleSessionCreated}
                    onPreviewHtml={handlePreviewHtml}
                    onPreviewImage={handlePreviewImage}
                />
            </main>

            {/* Full-screen Preview Modal */}
            <PreviewModal
                htmlContent={previewHtml}
                imageUrl={previewImage}
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
            />
        </div>
    );
}
