import React, { useEffect, useRef, useState } from 'react';
import { X, Download, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { createIframeBlobUrl, revokeIframeBlobUrl, downloadHtmlFile } from '../utils/codeRenderer';

interface PreviewPanelProps {
    htmlContent: string | null;
    imageUrl: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PreviewPanel({ htmlContent, imageUrl, isOpen, onClose }: PreviewPanelProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (htmlContent) {
            const url = createIframeBlobUrl(htmlContent);
            setBlobUrl(prev => {
                if (prev) revokeIframeBlobUrl(prev);
                return url;
            });
        } else {
            setBlobUrl(prev => {
                if (prev) revokeIframeBlobUrl(prev);
                return null;
            });
        }
    }, [htmlContent]);

    useEffect(() => {
        return () => {
            if (blobUrl) revokeIframeBlobUrl(blobUrl);
        };
    }, []);

    const handleRefresh = () => {
        setKey(k => k + 1);
    };

    const handleDownload = () => {
        if (htmlContent) {
            downloadHtmlFile(htmlContent);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`flex flex-col border-l border-border/50 bg-background transition-all duration-300 ${
                isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-medium text-foreground">
                        {imageUrl ? 'Generated Image' : 'Live Preview'}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {htmlContent && (
                        <>
                            <button
                                onClick={handleRefresh}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                style={{
                                    background: 'oklch(0.52 0.22 290 / 0.15)',
                                    border: '1px solid oklch(0.52 0.22 290 / 0.3)',
                                    color: 'oklch(0.72 0.18 290)',
                                }}
                            >
                                <Download className="w-3 h-3" />
                                Download HTML
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setIsFullscreen(f => !f)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {imageUrl ? (
                    <div className="flex items-center justify-center h-full p-4">
                        <img
                            src={imageUrl}
                            alt="Generated"
                            className="max-w-full max-h-full object-contain rounded-xl"
                        />
                    </div>
                ) : blobUrl ? (
                    <iframe
                        key={key}
                        ref={iframeRef}
                        src={blobUrl}
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        className="w-full h-full border-0"
                        title="App Preview"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No preview available
                    </div>
                )}
            </div>
        </div>
    );
}
