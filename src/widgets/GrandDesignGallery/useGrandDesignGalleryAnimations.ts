"use client";

import { useRef } from "react";
import { useArrayRefs, useScrollTriggerAutoRefresh } from "@/shared/hooks";
import { useGSAP, gsap } from "@/shared/lib/gsap";

const PARALLAX_PERCENT = 8;
const PARALLAX_SCALE = 1.18;

const isCompact = () => window.matchMedia("(max-width: 767px)").matches;

export function useGrandDesignGalleryAnimations() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const { refs: tileRefs, setRef: setTileRef } = useArrayRefs<HTMLButtonElement>();

    useScrollTriggerAutoRefresh();

    useGSAP(
        () => {
            // Desktop/tablet only - skipped on phones both because the tiles
            // are small enough there that the parallax offset wouldn't read,
            // and because a per-tile ScrollTrigger + scrub on every frame the
            // grid is in view isn't worth the cost on lower-powered devices.
            if (isCompact()) return;

            tileRefs.current.forEach((tile) => {
                const image = tile?.querySelector("img");
                if (!image) return;

                // Phase 1 - setup: scale the image up by 18% so its vertical
                // pan (below) always has extra room to move within the tile's
                // fixed crop without ever exposing an edge.
                gsap.set(image, { scale: PARALLAX_SCALE });

                // Phase 2 - parallax scrub: as the tile itself travels from
                // just below the viewport ("top bottom") to just above it
                // ("bottom top"), pan the image linearly from -8% to +8% of
                // its own height. scrub: true ties this directly to scroll
                // position (no easing/lag) - the image drifts opposite to the
                // scroll direction, the classic parallax depth cue.
                gsap.fromTo(
                    image,
                    { yPercent: -PARALLAX_PERCENT },
                    {
                        yPercent: PARALLAX_PERCENT,
                        ease: "none",
                        scrollTrigger: {
                            trigger: tile,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    }
                );
            });
        },
        { scope: gridRef }
    );

    return { sectionRef, gridRef, setTileRef, tileRefs };
}
