"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP, gsap } from "@/shared/lib/gsap";
import { useScrollTriggerAutoRefresh } from "@/shared/hooks";

// ================================================================
// This whole file builds ONE GSAP timeline pinned to the hero's scroll
// distance via ScrollTrigger (start: "top top", end: "bottom bottom",
// scrub: true) - scrolling through the hero maps 1:1 to this timeline's
// progress from 0 to 1. Every PHASE_* constant below is a position on
// that 0-1 timeline, not a real-time delay. In broad strokes, in the
// order the phases actually play out:
//
//   1. Morph            (0    -> 0.362) headline recedes, "Safari" flies
//                                        from the headline to a big
//                                        centered watermark, background
//                                        darkens to flat.
//   2. Backdrop reveal   (0.39 -> 0.52)  a car-photo backdrop + glow fade
//                                        in behind the watermark.
//   3. Lift              (0.44 -> 0.539) watermark rises while resting at
//                                        full size.
//   4. Shrink            (0.539-> 0.701) watermark keeps rising while
//                                        shrinking to its final size.
//      Feature reveal    (0.567-> 0.663) the headline/description feature
//                                        block fades in underneath it
//                                        (overlaps the shrink).
//   5. Backdrop hide     (0.60 -> 0.84)  the car-photo backdrop and glow
//                                        dissolve back out.
//      Gallery entry     (0.60 -> 1)     the next section slides up into
//                                        place from below (overlaps
//                                        everything from here on).
//   6. Hold + exit       (0.735-> 1)     watermark rises further and fades
//                                        out completely.
//      Feature exit      (0.71 -> 0.93) the feature block also rises,
//                                        shrinks and fades (overlaps the
//                                        watermark's exit).
//
// A final `tl.to({}, {duration:1}, 0)` dummy tween pins the timeline's
// total length to exactly 1, so every PHASE_* fraction above lines up
// directly with scroll progress regardless of what the last real tween's
// end time would otherwise be.
// ================================================================

const SAFARI_GOLD = "#D9AE73";
const SAFARI_FINAL_SHRINK_PX = 100;
const SAFARI_LIFT_RISE_RATIO = -0.2;
const SAFARI_FINAL_RISE_RATIO = -0.3;
const SAFARI_EXIT_RISE_RATIO = -0.62;
const FEATURE_EXIT_SCALE = 0.88;
const FEATURE_EXIT_RISE_RATIO = -0.32;
const PHASE_MORPH_END = 0.362;
const PHASE_REST_END = 0.44;
const PHASE_LIFT_END = 0.539;
const PHASE_SHRINK_START = PHASE_LIFT_END;
const PHASE_SHRINK_END = 0.701;
const PHASE_BACKDROP_REVEAL_START = 0.39;
const PHASE_BACKDROP_REVEAL_END = 0.52;
const PHASE_BACKDROP_HIDE_START = 0.6;
const PHASE_BACKDROP_FADE_START = 0.73;
const PHASE_BACKDROP_GLOW_HIDE_END = 0.76;
const PHASE_BACKDROP_HIDE_END = 0.84;
const PHASE_FEATURE_REVEAL_START = 0.567;
const PHASE_FEATURE_REVEAL_END = 0.663;
const PHASE_HOLD_END = 0.735;
const PHASE_SAFARI_EXIT_START = PHASE_HOLD_END;
const PHASE_SAFARI_EXIT_END = 1;
const PHASE_FEATURE_EXIT_START = 0.71;
const PHASE_FEATURE_EXIT_END = 0.93;
const PHASE_GALLERY_ENTRY_START = 0.6;
const PHASE_GALLERY_ENTRY_END = 1;

export function useHeroSectionAnimations(enabled = true) {
    const reduced = useReducedMotion();

    useScrollTriggerAutoRefresh([reduced, enabled]);

    const wrapRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const skyRef = useRef<HTMLDivElement>(null);
    const carRef = useRef<HTMLDivElement>(null);
    const scrimRef = useRef<HTMLDivElement>(null);
    const solidRef = useRef<HTMLDivElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);
    const ghostRef = useRef<HTMLSpanElement>(null);
    const cloneRef = useRef<HTMLDivElement>(null);
    const cloneGradientRef = useRef<HTMLDivElement>(null);
    const endGhostRef = useRef<HTMLDivElement>(null);
    const safariBackdropGlowRef = useRef<HTMLDivElement>(null);
    const safariBackdropRef = useRef<HTMLDivElement>(null);
    const safariBackdropVeilRef = useRef<HTMLDivElement>(null);
    const featureBlockRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const wrap = wrapRef.current;
            const stage = stageRef.current;
            const sky = skyRef.current;
            const car = carRef.current;
            const scrim = scrimRef.current;
            const solid = solidRef.current;
            const copy = copyRef.current;
            const ghost = ghostRef.current;
            const clone = cloneRef.current;
            const cloneGradient = cloneGradientRef.current;
            const endGhost = endGhostRef.current;
            const safariBackdropGlow = safariBackdropGlowRef.current;
            const safariBackdrop = safariBackdropRef.current;
            const safariBackdropVeil = safariBackdropVeilRef.current;
            const featureBlock = featureBlockRef.current;
            const gallery = document.getElementById("grand-design");

            if (
                !wrap ||
                !stage ||
                !sky ||
                !car ||
                !scrim ||
                !solid ||
                !copy ||
                !ghost ||
                !clone ||
                !cloneGradient ||
                !endGhost ||
                !safariBackdropGlow ||
                !safariBackdrop ||
                !safariBackdropVeil ||
                !featureBlock
            ) {
                return;
            }

            if (reduced) {
                gsap.set(
                    [
                        ghost,
                        sky,
                        car,
                        scrim,
                        solid,
                        copy,
                        safariBackdropGlow,
                        safariBackdrop,
                        safariBackdropVeil,
                    ],
                    { clearProps: "all" }
                );
                if (gallery) {
                    gsap.set(gallery, { clearProps: "all" });
                }
                return;
            }

            const isCompactViewport = window.matchMedia("(max-width: 768px)").matches;
            const glowHiddenFilter = isCompactViewport ? "blur(28px)" : "blur(88px)";
            const glowVisibleFilter = isCompactViewport ? "blur(28px)" : "blur(34px)";
            const glowExitFilter = isCompactViewport ? "blur(32px)" : "blur(52px)";
            const backdropInitialFilter = isCompactViewport
                ? "none"
                : "blur(20px) brightness(0.68) saturate(0.84)";
            const backdropVisibleFilter = isCompactViewport
                ? "none"
                : "blur(0px) brightness(1) saturate(1)";
            const backdropExitFilter = isCompactViewport
                ? "none"
                : "blur(3px) brightness(0.82) saturate(0.92)";
            const ghostTopNeutral = () => {
                const copyY = gsap.getProperty(copy, "y") as number;
                return ghost.getBoundingClientRect().top - copyY;
            };
            const dx = () => {
                const from = ghost.getBoundingClientRect();
                const to = endGhost.getBoundingClientRect();
                return from.left + from.width / 2 - (to.left + to.width / 2);
            };
            const dy = () => {
                const from = ghost.getBoundingClientRect();
                const to = endGhost.getBoundingClientRect();
                return ghostTopNeutral() + from.height / 2 - (to.top + to.height / 2);
            };
            const startScale = () => {
                const from = ghost.getBoundingClientRect();
                const to = endGhost.getBoundingClientRect();
                return from.height / to.height;
            };
            const liftY = () => SAFARI_LIFT_RISE_RATIO * stage.getBoundingClientRect().height;
            const finalY = () => SAFARI_FINAL_RISE_RATIO * stage.getBoundingClientRect().height;
            const exitY = () => SAFARI_EXIT_RISE_RATIO * stage.getBoundingClientRect().height;
            const featureExitY = () =>
                FEATURE_EXIT_RISE_RATIO * stage.getBoundingClientRect().height;
            const scrollDistance = () =>
                Math.max(wrap.offsetHeight - stage.getBoundingClientRect().height, 0);
            const galleryTopAtPhase = (phase: number) =>
                wrap.offsetHeight - phase * scrollDistance();
            const galleryEntranceStartOffset = () => {
                const stageHeight = stage.getBoundingClientRect().height;
                return stageHeight - galleryTopAtPhase(PHASE_GALLERY_ENTRY_START);
            };
            const galleryEntranceEndOffset = () => -stage.getBoundingClientRect().height;
            const galleryEntranceStartY = () =>
                galleryEntranceStartOffset() - galleryEntranceEndOffset();
            const endScale = () => {
                const fontSize = Number.parseFloat(window.getComputedStyle(clone).fontSize);

                if (!Number.isFinite(fontSize) || fontSize <= SAFARI_FINAL_SHRINK_PX) {
                    return 0.85;
                }

                return (fontSize - SAFARI_FINAL_SHRINK_PX) / fontSize;
            };

            gsap.set(ghost, { autoAlpha: 0 });
            gsap.set(clone, {
                xPercent: -50,
                yPercent: -50,
                transformOrigin: "50% 50%",
                x: dx,
                y: dy,
                scale: startScale,
                color: "#ffffff",
            });
            gsap.set(cloneGradient, {
                xPercent: -50,
                yPercent: -50,
                transformOrigin: "50% 50%",
                x: dx,
                y: dy,
                scale: startScale,
                opacity: 0,
            });
            gsap.set(safariBackdropGlow, {
                autoAlpha: 0,
                scale: 0.76,
                yPercent: 8,
                filter: glowHiddenFilter,
            });
            gsap.set(safariBackdrop, {
                autoAlpha: 0,
                scale: 1.09,
                yPercent: 12,
                filter: backdropInitialFilter,
            });
            gsap.set(safariBackdropVeil, { autoAlpha: 0, yPercent: 8 });
            gsap.set(featureBlock, { autoAlpha: 0, y: 24 });
            if (gallery) {
                gsap.set(gallery, {
                    marginTop: galleryEntranceEndOffset,
                    y: galleryEntranceStartY,
                    force3D: true,
                });
            }

            if (!enabled) {
                return;
            }

            const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    trigger: wrap,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                    invalidateOnRefresh: true,
                },
            });

            // ========================================================
            // Phase 1 - Morph (0 -> PHASE_MORPH_END, 0.362)
            // The opening photo (car + sky) pushes up and zooms slightly
            // like a parallax dolly, while scrim/solid darken it to a flat
            // background. At the same time the "Safari" ghost text inside
            // the headline morphs into `clone`/`cloneGradient`: it flies
            // from the headline's exact position (dx/dy/startScale, all
            // measured live off `ghost`'s and `endGhost`'s rects) to dead
            // center, growing to full watermark size and shifting from
            // white to gold as `cloneGradient`'s gradient fill fades in on
            // top of it near the end of this phase. `copy` (the rest of the
            // headline/description/CTA) fades out and lifts away early.
            // ========================================================
            tl.fromTo(
                car,
                { yPercent: 0, scale: 1 },
                { yPercent: -15, scale: 1.06, duration: PHASE_MORPH_END },
                0
            )
                .fromTo(sky, { yPercent: 0 }, { yPercent: -9, duration: PHASE_MORPH_END }, 0)
                .fromTo(
                    scrim,
                    { opacity: 0.12 },
                    { opacity: 1, duration: PHASE_MORPH_END * 0.69 },
                    PHASE_MORPH_END * 0.15
                )
                .fromTo(
                    solid,
                    { opacity: 0 },
                    { opacity: 1, duration: PHASE_MORPH_END * 0.77 },
                    PHASE_MORPH_END * 0.31
                )
                .fromTo(
                    copy,
                    { autoAlpha: 1, y: 0 },
                    { autoAlpha: 0, y: -36, duration: PHASE_MORPH_END * 0.43 },
                    0
                )
                .fromTo(
                    clone,
                    { x: dx, y: dy, scale: startScale, color: "#ffffff" },
                    { x: 0, y: 0, scale: 1, color: SAFARI_GOLD, duration: PHASE_MORPH_END },
                    0
                )
                .fromTo(
                    cloneGradient,
                    { x: dx, y: dy, scale: startScale },
                    { x: 0, y: 0, scale: 1, duration: PHASE_MORPH_END },
                    0
                )
                .fromTo(
                    cloneGradient,
                    { opacity: 0 },
                    { opacity: 1, duration: PHASE_MORPH_END * 0.31 },
                    PHASE_MORPH_END * 0.77
                )
                // ====================================================
                // Phase 2 - Backdrop reveal (0.39 -> 0.52)
                // A soft gold glow (safariBackdropGlow) and the car-photo
                // backdrop image (safariBackdrop) fade and sharpen in
                // behind the watermark - starts right at the tail of the
                // morph phase, while the watermark is still settling.
                // ====================================================
                .fromTo(
                    safariBackdropGlow,
                    { autoAlpha: 0, scale: 0.76, yPercent: 8, filter: glowHiddenFilter },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        yPercent: 0,
                        filter: glowVisibleFilter,
                        duration: PHASE_BACKDROP_REVEAL_END - PHASE_BACKDROP_REVEAL_START,
                        ease: "power3.out",
                        immediateRender: false,
                    },
                    PHASE_BACKDROP_REVEAL_START
                )
                .fromTo(
                    safariBackdrop,
                    {
                        autoAlpha: 0,
                        scale: 1.09,
                        yPercent: 12,
                        filter: backdropInitialFilter,
                    },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        yPercent: 0,
                        filter: backdropVisibleFilter,
                        duration: PHASE_BACKDROP_REVEAL_END - PHASE_BACKDROP_REVEAL_START,
                        ease: "power3.out",
                        immediateRender: false,
                    },
                    PHASE_BACKDROP_REVEAL_START
                )
                // ====================================================
                // Phase 3 - Lift (PHASE_REST_END 0.44 -> PHASE_LIFT_END
                // 0.539)
                // The watermark has been sitting still (full size, centered)
                // since the morph finished at 0.362; from here it starts
                // rising (liftY, a fraction of the stage's own height so it
                // scales with viewport size) while still at full scale.
                // ====================================================
                .fromTo(
                    clone,
                    { x: 0, y: 0, scale: 1 },
                    {
                        x: 0,
                        y: liftY,
                        scale: 1,
                        duration: PHASE_LIFT_END - PHASE_REST_END,
                        immediateRender: false,
                    },
                    PHASE_REST_END
                )
                .fromTo(
                    cloneGradient,
                    { x: 0, y: 0, scale: 1 },
                    {
                        x: 0,
                        y: liftY,
                        scale: 1,
                        duration: PHASE_LIFT_END - PHASE_REST_END,
                        immediateRender: false,
                    },
                    PHASE_REST_END
                )
                // ====================================================
                // Phase 4 - Backdrop hide (PHASE_BACKDROP_HIDE_START 0.60 ->
                // PHASE_BACKDROP_HIDE_END 0.84)
                // The glow and backdrop photo from phase 2 dissolve back
                // out: the glow fades/blurs away first (ends at 0.76), the
                // backdrop scales down slightly and darkens while a veil
                // gradient fades in over it to help mask the transition,
                // then the backdrop's own opacity fades the rest of the way
                // out starting at PHASE_BACKDROP_FADE_START (0.73). This
                // overlaps with the gallery entry and feature reveal below.
                // ====================================================
                .fromTo(
                    safariBackdropGlow,
                    { autoAlpha: 1, scale: 1, yPercent: 0, filter: glowVisibleFilter },
                    {
                        autoAlpha: 0,
                        scale: 1.03,
                        yPercent: 12,
                        filter: glowExitFilter,
                        duration: PHASE_BACKDROP_GLOW_HIDE_END - PHASE_BACKDROP_HIDE_START,
                        ease: "power2.inOut",
                        immediateRender: false,
                    },
                    PHASE_BACKDROP_HIDE_START
                )
                .fromTo(
                    safariBackdrop,
                    {
                        scale: 1,
                        yPercent: 0,
                        filter: backdropVisibleFilter,
                    },
                    {
                        scale: 0.992,
                        yPercent: 24,
                        filter: backdropExitFilter,
                        duration: PHASE_BACKDROP_HIDE_END - PHASE_BACKDROP_HIDE_START,
                        ease: "power3.in",
                        immediateRender: false,
                    },
                    PHASE_BACKDROP_HIDE_START
                )
                .fromTo(
                    safariBackdropVeil,
                    { autoAlpha: 0, yPercent: 8 },
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                        duration: PHASE_BACKDROP_HIDE_END - PHASE_BACKDROP_HIDE_START,
                        ease: "power2.out",
                        immediateRender: false,
                    },
                    PHASE_BACKDROP_HIDE_START
                )
                .fromTo(
                    safariBackdrop,
                    { autoAlpha: 1 },
                    {
                        autoAlpha: 0,
                        duration: PHASE_BACKDROP_HIDE_END - PHASE_BACKDROP_FADE_START,
                        ease: "power2.out",
                        immediateRender: false,
                    },
                    PHASE_BACKDROP_FADE_START
                )
                // ====================================================
                // Feature reveal (PHASE_FEATURE_REVEAL_START 0.567 ->
                // PHASE_FEATURE_REVEAL_END 0.663) - runs in parallel with
                // the tail of the backdrop hide and the shrink below.
                // The headline/description feature block fades and rises
                // into place, taking over as the watermark shrinks away
                // above it.
                // ====================================================
                .fromTo(
                    featureBlock,
                    { autoAlpha: 0, y: 24 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: PHASE_FEATURE_REVEAL_END - PHASE_FEATURE_REVEAL_START,
                        immediateRender: false,
                    },
                    PHASE_FEATURE_REVEAL_START
                )
                // ====================================================
                // Phase 5 - Shrink (PHASE_SHRINK_START = PHASE_LIFT_END
                // 0.539 -> PHASE_SHRINK_END 0.701)
                // The watermark keeps rising (to finalY) while now also
                // shrinking down to endScale (computed from its current
                // font-size so the shrink amount, SAFARI_FINAL_SHRINK_PX,
                // stays visually consistent across viewport sizes).
                // ====================================================
                .fromTo(
                    clone,
                    { x: 0, y: liftY, scale: 1 },
                    {
                        x: 0,
                        y: finalY,
                        scale: endScale,
                        duration: PHASE_SHRINK_END - PHASE_SHRINK_START,
                        ease: "sine.out",
                        immediateRender: false,
                    },
                    PHASE_SHRINK_START
                )
                .fromTo(
                    cloneGradient,
                    { x: 0, y: liftY, scale: 1 },
                    {
                        x: 0,
                        y: finalY,
                        scale: endScale,
                        duration: PHASE_SHRINK_END - PHASE_SHRINK_START,
                        ease: "sine.out",
                        immediateRender: false,
                    },
                    PHASE_SHRINK_START
                )
                // ====================================================
                // Phase 6 - Hold + exit
                // The shrink ends at PHASE_SHRINK_END (0.701) but the exit
                // tween below doesn't start until PHASE_SAFARI_EXIT_START
                // (= PHASE_HOLD_END, 0.735) - so the watermark just holds
                // still at its shrunk size for that stretch. From 0.735 to
                // 1 (PHASE_SAFARI_EXIT_END) it rises further (exitY) and
                // fades out completely, finishing exactly as the hero's
                // scroll distance runs out.
                // ====================================================
                .fromTo(
                    clone,
                    { y: finalY, autoAlpha: 1 },
                    {
                        y: exitY,
                        autoAlpha: 0,
                        duration: PHASE_SAFARI_EXIT_END - PHASE_SAFARI_EXIT_START,
                        immediateRender: false,
                    },
                    PHASE_SAFARI_EXIT_START
                )
                .fromTo(
                    cloneGradient,
                    { y: finalY, autoAlpha: 1 },
                    {
                        y: exitY,
                        autoAlpha: 0,
                        duration: PHASE_SAFARI_EXIT_END - PHASE_SAFARI_EXIT_START,
                        immediateRender: false,
                    },
                    PHASE_SAFARI_EXIT_START
                )
                // ====================================================
                // Feature exit (PHASE_FEATURE_EXIT_START 0.71 ->
                // PHASE_FEATURE_EXIT_END 0.93) - overlaps the watermark's
                // hold+exit above. The feature block that revealed itself
                // earlier now rises, shrinks slightly and fades away too,
                // clearing the stage for the gallery entry to take over.
                // ====================================================
                .fromTo(
                    featureBlock,
                    { y: 0, scale: 1, autoAlpha: 1 },
                    {
                        y: featureExitY,
                        scale: FEATURE_EXIT_SCALE,
                        autoAlpha: 0,
                        duration: PHASE_FEATURE_EXIT_END - PHASE_FEATURE_EXIT_START,
                        immediateRender: false,
                    },
                    PHASE_FEATURE_EXIT_START
                );

            // ========================================================
            // Gallery entry (PHASE_GALLERY_ENTRY_START 0.60 -> 1) - the
            // longest-running phase, overlapping backdrop hide, feature
            // reveal/exit and the watermark's hold+exit. The next section
            // (#grand-design) starts below the fold (see the initial
            // gsap.set(gallery, ...) above, offset via
            // galleryEntranceStartY/marginTop) and slides up to its
            // natural resting position (y: 0) exactly as the hero's
            // scroll distance runs out, handing off to it seamlessly.
            // ========================================================
            if (gallery) {
                tl.to(
                    gallery,
                    {
                        y: 0,
                        duration: PHASE_GALLERY_ENTRY_END - PHASE_GALLERY_ENTRY_START,
                        immediateRender: false,
                    },
                    PHASE_GALLERY_ENTRY_START
                );
            }

            // Dummy tween pinning the timeline's total duration to exactly
            // 1, so every PHASE_* fraction above maps directly onto scroll
            // progress (see the file-level comment).
            tl.to({}, { duration: 1 }, 0);
        },
        { scope: wrapRef, dependencies: [reduced, enabled], revertOnUpdate: true }
    );

    return {
        wrapRef,
        stageRef,
        skyRef,
        carRef,
        scrimRef,
        solidRef,
        copyRef,
        ghostRef,
        cloneRef,
        cloneGradientRef,
        endGhostRef,
        safariBackdropGlowRef,
        safariBackdropRef,
        safariBackdropVeilRef,
        featureBlockRef,
    };
}
