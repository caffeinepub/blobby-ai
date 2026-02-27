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

interface PromptCardsProps {
    onSelectPrompt: (text: string) => void;
}

export default function PromptCards({ onSelectPrompt }: PromptCardsProps) {
    return (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
            {/* Mascot + greeting */}
            <div className="blob-float blob-glow mb-6">
                <img
                    src="/assets/generated/blobby-mascot.dim_400x400.png"
                    alt="Blobby AI"
                    className="w-20 h-20 object-contain"
                />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground text-sm mb-8 text-center max-w-md">
                I can chat, write code, build apps, generate images, and much more. Try one of these:
            </p>

            {/* Prompt cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {PROMPT_CARDS.map((card) => (
                    <button
                        key={card.text}
                        onClick={() => onSelectPrompt(card.text)}
                        className="group flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, oklch(0.16 0.015 280) 0%, oklch(0.14 0.012 285) 100%)',
                            border: '1px solid oklch(0.25 0.02 280)',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.52 0.22 290 / 0.4)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px oklch(0.52 0.22 290 / 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.25 0.02 280)';
                            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        }}
                    >
                        <div
                            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'oklch(0.52 0.22 290 / 0.15)',
                                color: 'oklch(0.72 0.18 290)',
                            }}
                        >
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground group-hover:text-white transition-colors">
                                {card.text}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
