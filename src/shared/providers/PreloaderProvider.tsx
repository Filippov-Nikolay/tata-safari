"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const DISMISS_DELAY_MS = 2250;

interface PreloaderContextValue {
    isShown: boolean;
    isReady: boolean;
    onExitComplete: () => void;
}

const PreloaderContext = createContext<PreloaderContextValue | null>(null);

interface PreloaderProviderProps {
    children: React.ReactNode;
}

export function PreloaderProvider({ children }: PreloaderProviderProps) {
    const [shouldHide, setShouldHide] = useState(false);
    const [didExit, setDidExit] = useState(false);

    const isShown = !shouldHide;
    const isReady = didExit;

    useEffect(() => {
        if (shouldHide) {
            return;
        }

        const timer = window.setTimeout(() => {
            setShouldHide(true);
        }, DISMISS_DELAY_MS);

        return () => {
            window.clearTimeout(timer);
        };
    }, [shouldHide]);

    const onExitComplete = useCallback(() => {
        setDidExit(true);
    }, []);

    return (
        <PreloaderContext.Provider value={{ isShown, isReady, onExitComplete }}>
            {children}
        </PreloaderContext.Provider>
    );
}

export function usePreloader(): PreloaderContextValue {
    const ctx = useContext(PreloaderContext);
    if (!ctx) throw new Error("usePreloader must be used inside PreloaderProvider");
    return ctx;
}

PreloaderProvider.displayName = "PreloaderProvider";
