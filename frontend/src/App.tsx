import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import OnboardingScreen from './components/OnboardingScreen';
import LoginScreen from './components/LoginScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import Layout from './components/Layout';

const ONBOARDING_KEY = 'blobby_onboarding_seen';

export default function App() {
    const [onboardingSeen, setOnboardingSeen] = useState<boolean>(() => {
        return localStorage.getItem(ONBOARDING_KEY) === 'true';
    });

    const { identity, isInitializing } = useInternetIdentity();
    const isAuthenticated = !!identity;

    const {
        data: userProfile,
        isLoading: profileLoading,
        isFetched: profileFetched,
    } = useGetCallerUserProfile();

    const handleOnboardingComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setOnboardingSeen(true);
    };

    // Show onboarding on first visit (before login)
    if (!onboardingSeen) {
        return <OnboardingScreen onStart={handleOnboardingComplete} />;
    }

    // Show loading while identity is initializing
    if (isInitializing) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="blob-float blob-glow">
                        <img
                            src="/assets/generated/blobby-mascot.dim_400x400.png"
                            alt="Blobby AI"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="typing-dot w-2 h-2 rounded-full bg-violet" style={{ animationDelay: '0ms' }} />
                        <span className="typing-dot w-2 h-2 rounded-full bg-violet" style={{ animationDelay: '200ms' }} />
                        <span className="typing-dot w-2 h-2 rounded-full bg-violet" style={{ animationDelay: '400ms' }} />
                    </div>
                </div>
            </div>
        );
    }

    // Show login screen if not authenticated
    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    // Show loading while profile is being fetched
    if (profileLoading && !profileFetched) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="blob-float blob-glow">
                        <img
                            src="/assets/generated/blobby-mascot.dim_400x400.png"
                            alt="Blobby AI"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">Loading your profile...</p>
                </div>
            </div>
        );
    }

    // Show profile setup if authenticated but no profile
    const showProfileSetup = isAuthenticated && profileFetched && userProfile === null;

    return (
        <>
            <Layout userProfile={userProfile ?? null} />
            {showProfileSetup && (
                <ProfileSetupModal onComplete={() => {}} />
            )}
        </>
    );
}
