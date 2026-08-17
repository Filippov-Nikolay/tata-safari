"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP, gsap } from "@/shared/lib/gsap";
import { useArrayRefs, useScrollTriggerAutoRefresh } from "@/shared/hooks";

const TILE_COUNT = 5;

const isCompact = () => window.matchMedia("(max-width: 768px)").matches;
const getGridStart = () => (isCompact() ? "top 98%" : "top 97%");
const getGridEnd = () => (isCompact() ? "top 60%" : "top 48%");

export function useGrandDesignGalleryAnimations(enabled = true) {
    const reduced = useReducedMotion();

    useScrollTriggerAutoRefresh([reduced, enabled]);

    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const { refs: tileRefs, setRef: setTileRef } = useArrayRefs<HTMLDivElement>();

    useGSAP(
        () => {
            const grid = gridRef.current;
            const tiles = tileRefs.current.filter((tile): tile is HTMLDivElement => tile !== null);

            if (!grid || tiles.length !== TILE_COUNT) return;

            if (!enabled) {
                gsap.set(tiles, { autoAlpha: 0 });
                return;
            }

            if (reduced) {
                gsap.set(tiles, { clearProps: "all" });
                return;
            }

            gsap.fromTo(
                tiles,
                { autoAlpha: 0, y: 64, scale: 0.96, filter: "blur(16px)" },
                {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 1,
                    ease: "none",
                    stagger: 0.18,
                    force3D: true,
                    scrollTrigger: {
                        trigger: grid,
                        start: getGridStart,
                        end: getGridEnd,
                        scrub: 0.8,
                        invalidateOnRefresh: true,
                    },
                },
            );
        },
        { scope: sectionRef, dependencies: [reduced, enabled], revertOnUpdate: true },
    );

    return { sectionRef, gridRef, setTileRef };
}
