import React from 'react';
import { Gamepad2, Image, Code2, Atom } from 'lucide-react';

interface PromptCard {
    icon: React.ReactNode;
    text: string;
    description: string;
}

const PROMPT_CARDS: PromptCard[] = [
    {
        icon: <Gamepad2 className="w-5 h-5" />,
        text: 'Build me a 3D game',
        description: 'Create an interactive browser game',
    },
    {
        icon: <Image className="w-5 h-5" />,
        text: 'Generate an image of a futuristic city',
        description: 'AI-powered image generation',
    },
    {
        icon: <Code2 className="w-5 h-5" />,
        text: 'Write me a Python script to scrape data',
        description: 'Code generation & automation',
    },
    {
        icon: <Atom className="w-5 h-5" />,
        text: 'Explain quantum computing simply',
        description: 'Clear explanations of complex topics',
    },
];

interface WelcomeScreenProps {
    onSelectPrompt: (text: string) => void;
}

export default function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 min-h-0">
            {/* Floating mascot */}
            <div className="mascot-float mascot-glow mb-6">
                <img
                    src="/assets/generated/blobby-mascot.dim_400x400.png"
                    alt="Blobby AI"
                    style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                />
            </div>

            {/* Heading */}
            <h1
                className="text-2xl font-bold text-center mb-8 leading-tight"
                style={{ color: 'oklch(0.97 0.005 280)' }}
            >
                What can I help with?
            </h1>

            {/* 2x2 Prompt Cards Grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {PROMPT_CARDS.map((card) => (
                    <button
                        key={card.text}
                        onClick={() => onSelectPrompt(card.text)}
                        className="group flex flex-col items-start gap-2 p-3.5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                        style={{
                            background: 'oklch(0.15 0.015 280)',
                            border: '1px solid oklch(0.22 0.02 280)',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.52 0.22 290 / 0.5)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px oklch(0.52 0.22 290 / 0.12)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.22 0.02 280)';
                            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'oklch(0.52 0.22 290 / 0.15)',
                                color: 'oklch(0.72 0.18 290)',
                            }}
                        >
                            {card.icon}
                        </div>
                        <div>
                            <p
                                className="text-xs font-semibold leading-snug"
                                style={{ color: 'oklch(0.90 0.01 280)' }}
                            >
                                {card.text}
                            </p>
                            <p
                                className="text-xs mt-0.5 leading-snug"
                                style={{ color: 'oklch(0.50 0.02 280)' }}
                            >
                                {card.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
