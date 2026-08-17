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
    const { refs: tileRefs, setRef: setTileRef } = useArrayRefs<HTMLDivElement>();

    useScrollTriggerAutoRefresh();

    useGSAP(
        () => {
            if (isCompact()) return;

            tileRefs.current.forEach((tile) => {
                const image = tile?.querySelector("img");
                if (!image) return;

                gsap.set(image, { scale: PARALLAX_SCALE });
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
                            scrub: 0.4,
                        },
                    },
                );
            });
        },
        { scope: gridRef },
    );

    return { sectionRef, gridRef, setTileRef };
}
