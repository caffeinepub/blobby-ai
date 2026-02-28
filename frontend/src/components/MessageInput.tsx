import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Send, Paperclip, ImageIcon, X } from 'lucide-react';
import { fileToBase64, createThumbnailUrl, revokeThumbnailUrl, validateImageFile } from '../utils/imageHandler';
import LoadingIndicator from './LoadingIndicator';

interface MessageInputProps {
    onSend: (text: string, imageBase64?: string) => void;
    isLoading: boolean;
    disabled?: boolean;
    initialValue?: string;
    onInitialValueConsumed?: () => void;
}

export default function MessageInput({
    onSend,
    isLoading,
    disabled = false,
    initialValue = '',
    onInitialValueConsumed,
}: MessageInputProps) {
    const [text, setText] = useState('');
    const [attachedImage, setAttachedImage] = useState<{ file: File; base64: string; thumbnailUrl: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle initial value (from prompt cards / welcome screen)
    useEffect(() => {
        if (initialValue) {
            setText(initialValue);
            textareaRef.current?.focus();
            onInitialValueConsumed?.();
        }
    }, [initialValue, onInitialValueConsumed]);

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
        }
    }, [text]);

    const handleImageFile = useCallback(async (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }
        const base64 = await fileToBase64(file);
        const thumbnailUrl = createThumbnailUrl(file);
        setAttachedImage(prev => {
            if (prev) revokeThumbnailUrl(prev.thumbnailUrl);
            return { file, base64, thumbnailUrl };
        });
    }, []);

    const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await handleImageFile(file);
        e.target.value = '';
    }, [handleImageFile]);

    const handleRemoveImage = useCallback(() => {
        setAttachedImage(prev => {
            if (prev) revokeThumbnailUrl(prev.thumbnailUrl);
            return null;
        });
    }, []);

    const handleSend = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed && !attachedImage) return;
        if (isLoading || disabled) return;

        onSend(trimmed || 'Analyze this image', attachedImage?.base64);
        setText('');
        setAttachedImage(prev => {
            if (prev) revokeThumbnailUrl(prev.thumbnailUrl);
            return null;
        });
    }, [text, attachedImage, isLoading, disabled, onSend]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            await handleImageFile(file);
        }
    }, [handleImageFile]);

    const canSend = (text.trim().length > 0 || !!attachedImage) && !isLoading && !disabled;

    return (
        <div
            className="w-full px-4 pb-4 pt-3"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Image thumbnail preview */}
            {attachedImage && (
                <div className="mb-2 flex items-start gap-2">
                    <div className="relative inline-block">
                        <img
                            src={attachedImage.thumbnailUrl}
                            alt="Attached"
                            className="w-16 h-16 rounded-lg object-cover border border-border/60"
                        />
                        <button
                            onClick={handleRemoveImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                            <X className="w-3 h-3 text-white" />
                        </button>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Image attached</span>
                </div>
            )}

            {/* Drag overlay */}
            {isDragging && (
                <div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed"
                    style={{
                        background: 'oklch(0.52 0.22 290 / 0.1)',
                        borderColor: 'oklch(0.52 0.22 290)',
                    }}
                >
                    <p className="text-sm font-medium" style={{ color: 'oklch(0.72 0.18 290)' }}>
                        Drop image here
                    </p>
                </div>
            )}

            {/* Input container */}
            <div
                className="relative flex items-end gap-2 rounded-2xl px-4 py-3 transition-all duration-200 w-full"
                style={{
                    background: 'oklch(0.14 0.012 280)',
                    border: `1px solid ${isDragging ? 'oklch(0.52 0.22 290)' : 'oklch(0.22 0.018 280)'}`,
                    boxShadow: isDragging ? '0 0 20px oklch(0.52 0.22 290 / 0.2)' : 'none',
                }}
            >
                {/* Action icons */}
                <div className="flex items-center gap-1 flex-shrink-0 pb-0.5">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Attach file"
                        disabled={isLoading}
                    >
                        <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Upload image"
                        disabled={isLoading}
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Blobby AI..."
                    disabled={isLoading || disabled}
                    rows={1}
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm resize-none outline-none leading-relaxed min-h-[24px] max-h-[200px] py-0.5 disabled:opacity-50"
                    style={{ scrollbarWidth: 'none' }}
                />

                {/* Send button / Loading */}
                <div className="flex-shrink-0 pb-0.5">
                    {isLoading ? (
                        <div className="p-1.5">
                            <LoadingIndicator />
                        </div>
                    ) : (
                        <button
                            onClick={handleSend}
                            disabled={!canSend}
                            className="p-2 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                            style={{
                                background: canSend
                                    ? 'linear-gradient(135deg, oklch(0.52 0.22 290) 0%, oklch(0.42 0.18 290) 100%)'
                                    : 'oklch(0.22 0.018 280)',
                                boxShadow: canSend ? '0 0 12px oklch(0.52 0.22 290 / 0.4)' : 'none',
                            }}
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden file inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
            />
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleImageSelect}
            />

            <p className="text-center text-xs text-muted-foreground/30 mt-2">
                Press Enter to send · Shift+Enter for new line
            </p>
        </div>
    );
}
