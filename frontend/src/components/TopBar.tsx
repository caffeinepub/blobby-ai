import React from 'react';
import { Menu, Settings } from 'lucide-react';

interface TopBarProps {
    onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
    return (
        <header
            className="flex items-center justify-between px-4 py-3 flex-shrink-0 z-20"
            style={{
                background: 'oklch(0.10 0.01 280)',
                borderBottom: '1px solid oklch(0.20 0.015 280)',
            }}
        >
            {/* Left: Hamburger */}
            <button
                onClick={onMenuToggle}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors hover:bg-accent"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Center: Title */}
            <span
                className="text-base font-semibold tracking-tight"
                style={{ color: 'oklch(0.95 0.01 280)' }}
            >
                Blobby AI
            </span>

            {/* Right: Settings */}
            <button
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors hover:bg-accent"
                aria-label="Settings"
            >
                <Settings className="w-5 h-5" />
            </button>
        </header>
    );
}
