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
    const [lenis, setLenis] = useState<Lenis | null>(null);

    useEffect(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion || isCompact()) {
            return;
        }

        const instance = new Lenis({ duration: 0.6 });
        const onTick = (time: number) => instance.raf(time * 1000);

        instance.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);
        setLenis(instance);

        return () => {
            gsap.ticker.remove(onTick);
            instance.destroy();
            setLenis(null);
        };
    }, []);

    return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

SmoothScrollProvider.displayName = "SmoothScrollProvider";
