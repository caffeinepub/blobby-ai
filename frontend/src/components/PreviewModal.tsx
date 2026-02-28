import React, { useEffect, useRef, useState } from 'react';
import { X, Download, RefreshCw } from 'lucide-react';
import { createIframeBlobUrl, revokeIframeBlobUrl, downloadHtmlFile } from '../utils/codeRenderer';

interface PreviewModalProps {
    htmlContent: string | null;
    imageUrl: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PreviewModal({ htmlContent, imageUrl, isOpen, onClose }: PreviewModalProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
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

    const handleRefresh = () => setKey(k => k + 1);

    const handleDownload = () => {
        if (htmlContent) downloadHtmlFile(htmlContent);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'oklch(0.08 0.01 280)' }}
        >
            {/* Modal Header */}
            <div
                className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid oklch(0.20 0.015 280)' }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-medium" style={{ color: 'oklch(0.90 0.01 280)' }}>
                        {imageUrl ? 'Generated Image' : 'Live Preview'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
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
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Close preview"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {imageUrl ? (
                    <div className="flex items-center justify-center h-full p-6">
                        <img
                            src={imageUrl}
                            alt="Generated"
                            className="max-w-full max-h-full object-contain rounded-xl"
                        />
                    </div>
                ) : blobUrl ? (
                    <iframe
                        key={key}
                        src={blobUrl}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        title="Preview"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm" style={{ color: 'oklch(0.50 0.02 280)' }}>No preview available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
