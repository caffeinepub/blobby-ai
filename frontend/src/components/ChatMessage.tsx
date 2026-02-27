import React, { useState, useCallback } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { getBadgeColor, type TaskType } from '../utils/taskClassifier';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    taskType?: TaskType;
    imageUrl?: string;
    generatedImageUrl?: string;
    isStreaming?: boolean;
    onPreviewCode?: (html: string) => void;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    return (
        <div className="relative group my-3 rounded-lg overflow-hidden border border-border/60">
            <div className="flex items-center justify-between px-4 py-2 bg-background/80 border-b border-border/40">
                <span className="text-xs text-muted-foreground font-mono">{language || 'code'}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto bg-background/60 text-sm">
                <code className="font-mono text-foreground/90 whitespace-pre">{code}</code>
            </pre>
        </div>
    );
}

type HeadingLevel = 1 | 2 | 3 | 4;

function Heading({ level, children }: { level: HeadingLevel; children: React.ReactNode }) {
    const sizeClass =
        level === 1 ? 'text-xl' :
        level === 2 ? 'text-lg' :
        level === 3 ? 'text-base' :
        'text-sm';

    const className = `${sizeClass} font-semibold mt-4 mb-2 text-foreground`;

    if (level === 1) return <h1 className={className}>{children}</h1>;
    if (level === 2) return <h2 className={className}>{children}</h2>;
    if (level === 3) return <h3 className={className}>{children}</h3>;
    return <h4 className={className}>{children}</h4>;
}

function parseMarkdown(text: string, onPreviewCode?: (html: string) => void): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    const lines = text.split('\n');
    let i = 0;
    let keyCounter = 0;

    const nextKey = () => `md-${keyCounter++}`;

    while (i < lines.length) {
        const line = lines[i];

        // Code block
        if (line.startsWith('```')) {
            const language = line.slice(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            const code = codeLines.join('\n');

            const isHtml =
                language === 'html' ||
                code.trim().startsWith('<!DOCTYPE') ||
                code.trim().startsWith('<html');

            nodes.push(
                <div key={nextKey()}>
                    <CodeBlock code={code} language={language} />
                    {isHtml && onPreviewCode && (
                        <button
                            onClick={() => onPreviewCode(code)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg mb-2 transition-colors"
                            style={{
                                background: 'oklch(0.52 0.22 290 / 0.15)',
                                border: '1px solid oklch(0.52 0.22 290 / 0.3)',
                                color: 'oklch(0.75 0.15 290)',
                            }}
                        >
                            <Download className="w-3 h-3" />
                            Preview App
                        </button>
                    )}
                </div>
            );
            i++;
            continue;
        }

        // Heading
        const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
        if (headingMatch) {
            const level = Math.min(headingMatch[1].length, 4) as HeadingLevel;
            const content = headingMatch[2];
            nodes.push(
                <Heading key={nextKey()} level={level}>
                    {renderInline(content)}
                </Heading>
            );
            i++;
            continue;
        }

        // Horizontal rule
        if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
            nodes.push(<hr key={nextKey()} className="border-border my-4" />);
            i++;
            continue;
        }

        // Unordered list
        if (line.match(/^[\s]*[-*+]\s/)) {
            const listItems: string[] = [];
            while (i < lines.length && lines[i].match(/^[\s]*[-*+]\s/)) {
                listItems.push(lines[i].replace(/^[\s]*[-*+]\s/, ''));
                i++;
            }
            nodes.push(
                <ul key={nextKey()} className="list-disc list-inside space-y-1 my-2 ml-2">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="text-foreground/90">{renderInline(item)}</li>
                    ))}
                </ul>
            );
            continue;
        }

        // Ordered list
        if (line.match(/^[\s]*\d+\.\s/)) {
            const listItems: string[] = [];
            while (i < lines.length && lines[i].match(/^[\s]*\d+\.\s/)) {
                listItems.push(lines[i].replace(/^[\s]*\d+\.\s/, ''));
                i++;
            }
            nodes.push(
                <ol key={nextKey()} className="list-decimal list-inside space-y-1 my-2 ml-2">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="text-foreground/90">{renderInline(item)}</li>
                    ))}
                </ol>
            );
            continue;
        }

        // Blockquote
        if (line.startsWith('> ')) {
            const quoteLines: string[] = [];
            while (i < lines.length && lines[i].startsWith('> ')) {
                quoteLines.push(lines[i].slice(2));
                i++;
            }
            nodes.push(
                <blockquote
                    key={nextKey()}
                    className="border-l-2 pl-4 my-3 italic text-muted-foreground"
                    style={{ borderColor: 'oklch(0.52 0.22 290)' }}
                >
                    {quoteLines.map((ql, idx) => <p key={idx}>{renderInline(ql)}</p>)}
                </blockquote>
            );
            continue;
        }

        // Table
        if (line.includes('|') && lines[i + 1]?.match(/^\|?[\s-|]+\|?$/)) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].includes('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            if (tableLines.length >= 2) {
                const headers = tableLines[0].split('|').filter(h => h.trim()).map(h => h.trim());
                const rows = tableLines.slice(2).map(row =>
                    row.split('|').filter(c => c.trim()).map(c => c.trim())
                );
                nodes.push(
                    <div key={nextKey()} className="overflow-x-auto my-3">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    {headers.map((h, idx) => (
                                        <th key={idx} className="border border-border/60 px-3 py-2 text-left font-semibold bg-muted/30">
                                            {renderInline(h)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-muted/10">
                                        {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="border border-border/60 px-3 py-2">
                                                {renderInline(cell)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            continue;
        }

        // Empty line
        if (line.trim() === '') {
            nodes.push(<div key={nextKey()} className="h-2" />);
            i++;
            continue;
        }

        // Regular paragraph
        nodes.push(
            <p key={nextKey()} className="text-foreground/90 leading-relaxed mb-1">
                {renderInline(line)}
            </p>
        );
        i++;
    }

    return nodes;
}

function renderInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
        // Bold
        const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
        if (boldMatch) {
            if (boldMatch[1]) parts.push(<span key={keyIdx++}>{renderInline(boldMatch[1])}</span>);
            parts.push(<strong key={keyIdx++} className="font-semibold text-foreground">{boldMatch[2]}</strong>);
            remaining = boldMatch[3];
            continue;
        }

        // Italic
        const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)/s);
        if (italicMatch) {
            if (italicMatch[1]) parts.push(<span key={keyIdx++}>{renderInline(italicMatch[1])}</span>);
            parts.push(<em key={keyIdx++} className="italic">{italicMatch[2]}</em>);
            remaining = italicMatch[3];
            continue;
        }

        // Inline code
        const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)/s);
        if (codeMatch) {
            if (codeMatch[1]) parts.push(<span key={keyIdx++}>{codeMatch[1]}</span>);
            parts.push(
                <code
                    key={keyIdx++}
                    className="px-1.5 py-0.5 rounded text-xs font-mono"
                    style={{
                        background: 'oklch(0.1 0.01 280)',
                        border: '1px solid oklch(0.25 0.02 280)',
                        color: 'oklch(0.75 0.15 290)',
                    }}
                >
                    {codeMatch[2]}
                </code>
            );
            remaining = codeMatch[3];
            continue;
        }

        // Link
        const linkMatch = remaining.match(/^(.*?)\[(.+?)\]\((.+?)\)(.*)/s);
        if (linkMatch) {
            if (linkMatch[1]) parts.push(<span key={keyIdx++}>{linkMatch[1]}</span>);
            parts.push(
                <a
                    key={keyIdx++}
                    href={linkMatch[3]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                    style={{ color: 'oklch(0.62 0.24 290)' }}
                >
                    {linkMatch[2]}
                </a>
            );
            remaining = linkMatch[4];
            continue;
        }

        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default function ChatMessage({
    role,
    content,
    taskType,
    imageUrl,
    generatedImageUrl,
    isStreaming = false,
    onPreviewCode,
}: ChatMessageProps) {
    const isUser = role === 'user';

    if (isUser) {
        return (
            <div className="flex justify-end mb-4 slide-up">
                <div className="max-w-[75%]">
                    {imageUrl && (
                        <div className="mb-2 flex justify-end">
                            <img
                                src={imageUrl}
                                alt="Uploaded"
                                className="max-w-xs max-h-48 rounded-xl object-cover border border-border/40"
                            />
                        </div>
                    )}
                    <div
                        className="px-4 py-3 rounded-2xl rounded-tr-sm text-white text-sm leading-relaxed"
                        style={{
                            background: 'linear-gradient(135deg, oklch(0.42 0.18 290) 0%, oklch(0.35 0.16 290) 100%)',
                            boxShadow: '0 2px 12px oklch(0.42 0.18 290 / 0.3)',
                        }}
                    >
                        {content}
                    </div>
                </div>
            </div>
        );
    }

    // Assistant message
    return (
        <div className="flex gap-3 mb-4 slide-up">
            {/* Blob avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mt-1">
                <img
                    src="/assets/generated/blobby-mascot.dim_400x400.png"
                    alt="Blobby"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0 max-w-[85%]">
                {/* Task type badge */}
                {taskType && (
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(taskType)}`}
                        >
                            {taskType}
                        </span>
                        <span className="text-xs text-muted-foreground">Blobby AI</span>
                    </div>
                )}

                {/* Message card */}
                <div
                    className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm message-glow"
                    style={{
                        background: 'linear-gradient(135deg, oklch(0.16 0.015 280) 0%, oklch(0.14 0.012 285) 100%)',
                    }}
                >
                    {isStreaming && content === '' ? (
                        <div className="flex items-center gap-1.5 py-1">
                            <span className="typing-dot w-2 h-2 rounded-full bg-violet" style={{ animationDelay: '0ms' }} />
                            <span className="typing-dot w-2 h-2 rounded-full bg-violet" style={{ animationDelay: '200ms' }} />
                            <span className="typing-dot w-2 h-2 rounded-full bg-violet" style={{ animationDelay: '400ms' }} />
                        </div>
                    ) : (
                        <div className="markdown-content">
                            {parseMarkdown(content, onPreviewCode)}
                        </div>
                    )}

                    {/* Generated image */}
                    {generatedImageUrl && (
                        <div className="mt-3">
                            <img
                                src={generatedImageUrl}
                                alt="Generated"
                                className="max-w-full rounded-xl border border-border/40"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
