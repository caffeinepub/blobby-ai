import React from 'react';
import { Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
    onStart: () => void;
}

const SUGGESTED_PROMPTS = [
    { icon: '🎮', text: 'Build me a 3D game' },
    { icon: '🌆', text: 'Generate an image of a futuristic city' },
    { icon: '🐍', text: 'Write me a Python script to scrape data' },
    { icon: '⚛️', text: 'Explain quantum computing simply' },
];

export default function OnboardingScreen({ onStart }: OnboardingScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 animate-fade-in">
            {/* Background gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, oklch(0.52 0.22 290) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <div
                    className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-8"
                    style={{
                        background: 'radial-gradient(circle, oklch(0.42 0.18 290) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
                {/* Blob mascot */}
                <div className="blob-float blob-glow mb-8">
                    <img
                        src="/assets/generated/blobby-mascot.dim_400x400.png"
                        alt="Blobby AI Mascot"
                        className="w-40 h-40 object-contain"
                    />
                </div>

                {/* Logo */}
                <img
                    src="/assets/generated/blobby-logo.dim_320x80.png"
                    alt="Blobby AI"
                    className="h-12 object-contain mb-4"
                />

                {/* Tagline */}
                <p className="text-muted-foreground text-center text-lg mb-2 font-light">
                    Your next-generation AI creative powerhouse
                </p>
                <p className="text-muted-foreground/60 text-center text-sm mb-10">
                    Chat, code, create apps, generate images, and more — all in one place.
                </p>

                {/* Start button */}
                <button
                    onClick={onStart}
                    className="group relative flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 mb-12"
                    style={{
                        background: 'linear-gradient(135deg, oklch(0.52 0.22 290) 0%, oklch(0.42 0.18 290) 100%)',
                        boxShadow: '0 0 30px oklch(0.52 0.22 290 / 0.4), 0 4px 20px oklch(0 0 0 / 0.3)',
                    }}
                >
                    <Sparkles className="w-4 h-4" />
                    Start Chatting
                    <div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                            background: 'linear-gradient(135deg, oklch(0.62 0.24 290) 0%, oklch(0.52 0.22 290) 100%)',
                        }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Start Chatting
                    </span>
                </button>

                {/* Prompt cards */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                        <div
                            key={prompt.text}
                            className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer hover:border-violet/40 hover:bg-card transition-all duration-200 group"
                            onClick={onStart}
                        >
                            <span className="text-2xl mb-2 block">{prompt.icon}</span>
                            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                {prompt.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="fixed bottom-4 left-0 right-0 flex flex-col items-center gap-1 z-10">
                <p className="text-muted-foreground/40 text-xs">
                    Built by Talha bin Saif
                </p>
                <p className="text-muted-foreground/30 text-xs">
                    Built with ❤️ using{' '}
                    <a
                        href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'blobby-ai')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-muted-foreground/60 transition-colors"
                    >
                        caffeine.ai
                    </a>
                </p>
            </footer>
        </div>
    );
}
