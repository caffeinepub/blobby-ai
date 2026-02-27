import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import PromptCards from './PromptCards';
import LoadingIndicator from './LoadingIndicator';
import { useGetSession, useSaveMessage, useCreateSession } from '../hooks/useQueries';
import { classifyTask, type TaskType } from '../utils/taskClassifier';
import { sendChatMessage, generateImage, type ChatMessage as AIChatMessage } from '../services/aiService';
import { extractHtmlFromMarkdown } from '../utils/codeRenderer';
import type { Message } from '../backend';

interface LocalMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    taskType?: TaskType;
    imageUrl?: string;
    generatedImageUrl?: string;
    isStreaming?: boolean;
}

interface ChatWindowProps {
    sessionId: string | null;
    onSessionCreated: (sessionId: string) => void;
    onPreviewHtml: (html: string) => void;
    onPreviewImage: (url: string) => void;
}

function backendMsgToLocal(msg: Message, idx: number): LocalMessage {
    return {
        id: `backend-${idx}`,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        taskType: undefined,
    };
}

export default function ChatWindow({
    sessionId,
    onSessionCreated,
    onPreviewHtml,
    onPreviewImage,
}: ChatWindowProps) {
    const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pendingPrompt, setPendingPrompt] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: session, isLoading: sessionLoading } = useGetSession(sessionId);
    const saveMessage = useSaveMessage();
    const createSession = useCreateSession();

    // Sync backend messages to local state when session loads
    useEffect(() => {
        if (session && session.messages.length > 0) {
            const msgs = session.messages.map((m, i) => backendMsgToLocal(m, i));
            setLocalMessages(msgs);
        } else if (session && session.messages.length === 0) {
            setLocalMessages([]);
        }
    }, [session?.id]);

    // Reset local messages when session changes
    useEffect(() => {
        if (!sessionId) {
            setLocalMessages([]);
        }
    }, [sessionId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages]);

    const handleSend = useCallback(async (text: string, imageBase64?: string) => {
        if (isGenerating) return;

        const classification = classifyTask(text, !!imageBase64);
        const { taskType, model } = classification;

        // Create session if needed
        let activeSessionId = sessionId;
        if (!activeSessionId) {
            const newId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            try {
                await createSession.mutateAsync({ id: newId, taskType });
                activeSessionId = newId;
                onSessionCreated(newId);
            } catch (err) {
                console.error('Failed to create session:', err);
                return;
            }
        }

        // Add user message locally
        const userMsgId = `user-${Date.now()}`;
        const userMsg: LocalMessage = {
            id: userMsgId,
            role: 'user',
            content: text,
            imageUrl: imageBase64 ? undefined : undefined,
        };

        // If image, create object URL for display
        if (imageBase64) {
            // Convert base64 to blob URL for display
            try {
                const base64Data = imageBase64.split(',')[1];
                const mimeType = imageBase64.split(';')[0].split(':')[1];
                const byteChars = atob(base64Data);
                const byteArr = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
                const blob = new Blob([byteArr], { type: mimeType });
                userMsg.imageUrl = URL.createObjectURL(blob);
            } catch {
                // ignore
            }
        }

        setLocalMessages(prev => [...prev, userMsg]);
        setIsGenerating(true);

        // Save user message to backend
        try {
            await saveMessage.mutateAsync({
                sessionId: activeSessionId,
                role: 'user',
                content: text,
            });
        } catch (err) {
            console.error('Failed to save user message:', err);
        }

        // Add streaming assistant message placeholder
        const assistantMsgId = `assistant-${Date.now()}`;
        const assistantMsg: LocalMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            taskType,
            isStreaming: true,
        };
        setLocalMessages(prev => [...prev, assistantMsg]);

        try {
            let fullResponse = '';

            if (taskType === 'ImageGen') {
                // Image generation
                const imageUrl = await generateImage(text);
                fullResponse = `Here's your generated image based on: "${text}"`;
                setLocalMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMsgId
                            ? { ...m, content: fullResponse, generatedImageUrl: imageUrl, isStreaming: false }
                            : m
                    )
                );
                onPreviewImage(imageUrl);
            } else {
                // Build conversation history for context
                const history: AIChatMessage[] = localMessages
                    .filter(m => m.id !== assistantMsgId)
                    .map(m => ({
                        role: m.role,
                        content: m.content,
                    }));

                // Add current user message with image if present
                if (imageBase64) {
                    history.push({
                        role: 'user',
                        content: [
                            { type: 'text', text },
                            { type: 'image_url', image_url: { url: imageBase64 } },
                        ],
                    });
                } else {
                    history.push({ role: 'user', content: text });
                }

                // Stream response
                fullResponse = await sendChatMessage(
                    history,
                    model,
                    (chunk) => {
                        setLocalMessages(prev =>
                            prev.map(m =>
                                m.id === assistantMsgId
                                    ? { ...m, content: m.content + chunk, isStreaming: false }
                                    : m
                            )
                        );
                    }
                );

                // Check for HTML content to preview
                const htmlContent = extractHtmlFromMarkdown(fullResponse);
                if (htmlContent && (taskType === 'AppBuild' || taskType === 'GameBuild')) {
                    onPreviewHtml(htmlContent);
                }
            }

            // Save assistant response to backend
            try {
                await saveMessage.mutateAsync({
                    sessionId: activeSessionId,
                    role: 'assistant',
                    content: fullResponse,
                });
            } catch (err) {
                console.error('Failed to save assistant message:', err);
            }

            // Invalidate session query
            queryClient.invalidateQueries({ queryKey: ['sessions'] });

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            setLocalMessages(prev =>
                prev.map(m =>
                    m.id === assistantMsgId
                        ? {
                            ...m,
                            content: `I encountered an error: ${errorMsg}\n\nPlease try again or rephrase your request.`,
                            isStreaming: false,
                        }
                        : m
                )
            );
        } finally {
            setIsGenerating(false);
        }
    }, [isGenerating, sessionId, localMessages, createSession, saveMessage, onSessionCreated, onPreviewHtml, onPreviewImage, queryClient]);

    const handlePromptSelect = useCallback((prompt: string) => {
        setPendingPrompt(prompt);
    }, []);

    const handlePreviewCode = useCallback((html: string) => {
        onPreviewHtml(html);
    }, [onPreviewHtml]);

    const showPromptCards = localMessages.length === 0 && !sessionLoading && !isGenerating;

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
                {sessionLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingIndicator />
                    </div>
                ) : showPromptCards ? (
                    <PromptCards onSelectPrompt={handlePromptSelect} />
                ) : (
                    <div className="max-w-3xl mx-auto">
                        {localMessages.map(msg => (
                            <ChatMessage
                                key={msg.id}
                                role={msg.role}
                                content={msg.content}
                                taskType={msg.taskType}
                                imageUrl={msg.imageUrl}
                                generatedImageUrl={msg.generatedImageUrl}
                                isStreaming={msg.isStreaming}
                                onPreviewCode={handlePreviewCode}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-border/30">
                <div className="max-w-3xl mx-auto">
                    <MessageInput
                        onSend={handleSend}
                        isLoading={isGenerating}
                        initialValue={pendingPrompt}
                        onInitialValueConsumed={() => setPendingPrompt('')}
                    />
                </div>
            </div>
        </div>
    );
}
