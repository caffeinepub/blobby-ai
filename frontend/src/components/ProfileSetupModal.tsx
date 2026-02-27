import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';

interface ProfileSetupModalProps {
    onComplete: () => void;
}

export default function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
    const [name, setName] = useState('');
    const saveProfile = useSaveCallerUserProfile();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            await saveProfile.mutateAsync({ name: name.trim() });
            onComplete();
        } catch (err) {
            console.error('Failed to save profile:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div
                className="w-full max-w-sm mx-4 p-6 rounded-2xl border border-border/50 shadow-2xl"
                style={{
                    background: 'linear-gradient(135deg, oklch(0.16 0.015 280) 0%, oklch(0.14 0.012 285) 100%)',
                    boxShadow: '0 0 40px oklch(0.52 0.22 290 / 0.15)',
                }}
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="blob-float blob-glow mb-4">
                        <img
                            src="/assets/generated/blobby-mascot.dim_400x400.png"
                            alt="Blobby"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Welcome to Blobby AI!</h2>
                    <p className="text-sm text-muted-foreground mt-1 text-center">
                        What should I call you?
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        autoFocus
                        maxLength={50}
                        className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all"
                        style={{
                            background: 'oklch(0.13 0.012 280)',
                            border: '1px solid oklch(0.25 0.02 280)',
                        }}
                        onFocus={e => {
                            (e.target as HTMLElement).style.borderColor = 'oklch(0.52 0.22 290 / 0.5)';
                        }}
                        onBlur={e => {
                            (e.target as HTMLElement).style.borderColor = 'oklch(0.25 0.02 280)';
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!name.trim() || saveProfile.isPending}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, oklch(0.52 0.22 290) 0%, oklch(0.42 0.18 290) 100%)',
                            boxShadow: '0 0 20px oklch(0.52 0.22 290 / 0.3)',
                        }}
                    >
                        <Sparkles className="w-4 h-4" />
                        {saveProfile.isPending ? 'Saving...' : "Let's go!"}
                    </button>
                </form>
            </div>
        </div>
    );
}
