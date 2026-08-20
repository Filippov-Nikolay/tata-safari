"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const MIN_PRELOADER_MS = 2250;

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
    const [minDelayDone, setMinDelayDone] = useState(false);
    const [pageReady, setPageReady] = useState(false);
    const [didExit, setDidExit] = useState(false);
    const exitRafRef = useRef<number[]>([]);

    const shouldHide = minDelayDone && pageReady;
    const isShown = !shouldHide;
    const isReady = didExit;

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setMinDelayDone(true);
        }, MIN_PRELOADER_MS);

        return () => {
            window.clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const waitForWindowLoad = new Promise<void>((resolve) => {
            if (document.readyState === "complete") {
                resolve();
                return;
            }

            const onLoad = () => resolve();
            window.addEventListener("load", onLoad, { once: true });
        });

        const waitForFonts =
            "fonts" in document && document.fonts?.ready
                ? document.fonts.ready.then(() => undefined)
                : Promise.resolve();

        Promise.all([waitForWindowLoad, waitForFonts]).then(() => {
            if (cancelled) {
                return;
            }

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!cancelled) {
                        setPageReady(true);
                    }
                });
            });
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const onExitComplete = useCallback(() => {
        exitRafRef.current.forEach((rafId) => cancelAnimationFrame(rafId));
        exitRafRef.current = [];

        const raf1 = requestAnimationFrame(() => {
            const raf2 = requestAnimationFrame(() => {
                setDidExit(true);
                exitRafRef.current = [];
            });

            exitRafRef.current = [raf1, raf2];
        });

        exitRafRef.current = [raf1];
    }, []);

    useEffect(() => {
        return () => {
            exitRafRef.current.forEach((rafId) => cancelAnimationFrame(rafId));
        };
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
