"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/shared/lib/gsap";

const isCompact = () => window.matchMedia("(max-width: 768px)").matches;

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
    return useContext(LenisContext);
}

interface SmoothScrollProviderProps {
    children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
    const [lenis] = useState<Lenis | null>(() => {
        if (typeof window === "undefined") {
            return null;
        }

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion || isCompact()) {
            return null;
        }

        return new Lenis({ duration: 0.6 });
    });

    useEffect(() => {
        if (!lenis) {
            return;
        }

        const onTick = (time: number) => lenis.raf(time * 1000);

        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(onTick);
            lenis.destroy();
        };
    }, [lenis]);

    return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

SmoothScrollProvider.displayName = "SmoothScrollProvider";
