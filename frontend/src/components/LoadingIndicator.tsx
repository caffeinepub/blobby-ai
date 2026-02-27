import React from 'react';

interface LoadingIndicatorProps {
    className?: string;
}

export default function LoadingIndicator({ className = '' }: LoadingIndicatorProps) {
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <span
                className="typing-dot w-2 h-2 rounded-full bg-violet"
                style={{ animationDelay: '0ms' }}
            />
            <span
                className="typing-dot w-2 h-2 rounded-full bg-violet"
                style={{ animationDelay: '200ms' }}
            />
            <span
                className="typing-dot w-2 h-2 rounded-full bg-violet"
                style={{ animationDelay: '400ms' }}
            />
        </div>
    );
}
