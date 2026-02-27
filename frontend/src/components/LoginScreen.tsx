import React from 'react';
import { Sparkles, Shield } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LoginScreen() {
    const { login, isLoggingIn } = useInternetIdentity();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
            {/* Background gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, oklch(0.52 0.22 290) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
                <div className="blob-float blob-glow mb-6">
                    <img
                        src="/assets/generated/blobby-mascot.dim_400x400.png"
                        alt="Blobby AI"
                        className="w-28 h-28 object-contain"
                    />
                </div>

                <img
                    src="/assets/generated/blobby-logo.dim_320x80.png"
                    alt="Blobby AI"
                    className="h-10 object-contain mb-3"
                />

                <p className="text-muted-foreground text-center text-sm mb-8">
                    Sign in to start chatting with your AI creative powerhouse
                </p>

                <button
                    onClick={login}
                    disabled={isLoggingIn}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                    style={{
                        background: 'linear-gradient(135deg, oklch(0.52 0.22 290) 0%, oklch(0.42 0.18 290) 100%)',
                        boxShadow: '0 0 30px oklch(0.52 0.22 290 / 0.4)',
                    }}
                >
                    <Shield className="w-4 h-4" />
                    {isLoggingIn ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground/50">
                    <Shield className="w-3 h-3" />
                    <span>Secure, private authentication</span>
                </div>
            </div>

            <footer className="fixed bottom-4 left-0 right-0 flex flex-col items-center gap-1">
                <p className="text-muted-foreground/30 text-xs">Built by Talha bin Saif</p>
                <p className="text-muted-foreground/25 text-xs">
                    Built with ❤️ using{' '}
                    <a
                        href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'blobby-ai')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-muted-foreground/50 transition-colors"
                    >
                        caffeine.ai
                    </a>
                </p>
            </footer>
        </div>
    );
}
