"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP, gsap } from "@/shared/lib/gsap";
import { useScrollTriggerAutoRefresh } from "@/shared/hooks";

const SAFARI_GOLD = "#D9AE73";
const SAFARI_FINAL_SHRINK_PX = 100;
const SAFARI_LIFT_RISE_RATIO = -0.20;
const SAFARI_FINAL_RISE_RATIO = -0.30;
const SAFARI_EXIT_RISE_RATIO = -0.62;
const FEATURE_EXIT_SCALE = 0.88;
const FEATURE_EXIT_RISE_RATIO = -0.20;
const GALLERY_FINAL_RISE_RATIO = -0.70;

const isCompact = () => window.matchMedia("(max-width: 768px)").matches;

const PHASE_MORPH_END = 0.370;
const PHASE_REST_END = 0.452;
const PHASE_LIFT_END = 0.553;
const PHASE_SHRINK_START = PHASE_LIFT_END;
const PHASE_SHRINK_END = 0.719;
const PHASE_FEATURE_REVEAL_START = 0.581;
const PHASE_FEATURE_REVEAL_END = 0.680;
const PHASE_HOLD_END = 0.756;
const PHASE_EXIT_START = PHASE_HOLD_END;
const PHASE_EXIT_END = 0.783;
const PHASE_GALLERY_SLIDE_START = PHASE_EXIT_END;
const PHASE_GALLERY_SLIDE_END = 1;

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
            const featureBlock = featureBlockRef.current;

            if (
                !wrap || !stage || !sky || !car || !scrim || !solid || !copy || !ghost ||
                !clone || !cloneGradient || !endGhost || !featureBlock
            ) {
                return;
            }

            if (!enabled) {
                return;
            }

            if (reduced || isCompact()) {
                gsap.set([ghost, sky, car, scrim, solid, copy], { clearProps: "all" });
                return;
            }

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
            const featureExitY = () => FEATURE_EXIT_RISE_RATIO * stage.getBoundingClientRect().height;
            const gallerySlideY = () => GALLERY_FINAL_RISE_RATIO * stage.getBoundingClientRect().height;
            const endScale = () => {
                const fontSize = Number.parseFloat(window.getComputedStyle(clone).fontSize);

                if (!Number.isFinite(fontSize) || fontSize <= SAFARI_FINAL_SHRINK_PX) {
                    return 0.85;
                }

                return (fontSize - SAFARI_FINAL_SHRINK_PX) / fontSize;
            };

        
        
        
        
            const gallery = document.getElementById("grand-design");

            gsap.set(ghost, { autoAlpha: 0 });
            gsap.set([clone, cloneGradient], {
                xPercent: -50,
                yPercent: -50,
                transformOrigin: "50% 50%",
            });
            gsap.set(cloneGradient, { opacity: 0 });
            gsap.set(featureBlock, { autoAlpha: 0, y: 24 });
            if (gallery) {
                gsap.set(gallery, { y: 0 });
            }

            const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    trigger: wrap,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.9,
                    invalidateOnRefresh: true,
                },
            })
                .fromTo(
                    car,
                    { yPercent: 0, scale: 1 },
                    { yPercent: -26, scale: 1.06, duration: PHASE_MORPH_END },
                    0,
                )
                .fromTo(sky, { yPercent: 0 }, { yPercent: -9, duration: PHASE_MORPH_END }, 0)
                .fromTo(
                    scrim,
                    { opacity: 0.12 },
                    { opacity: 1, duration: PHASE_MORPH_END * 0.69 },
                    PHASE_MORPH_END * 0.15,
                )
                .fromTo(
                    solid,
                    { opacity: 0 },
                    { opacity: 1, duration: PHASE_MORPH_END * 0.77 },
                    PHASE_MORPH_END * 0.31,
                )
                .fromTo(
                    copy,
                    { autoAlpha: 1, y: 0 },
                    { autoAlpha: 0, y: -36, duration: PHASE_MORPH_END * 0.43 },
                    0,
                )
                .fromTo(
                    clone,
                    { x: dx, y: dy, scale: startScale, color: "#ffffff" },
                    { x: 0, y: 0, scale: 1, color: SAFARI_GOLD, duration: PHASE_MORPH_END },
                    0,
                )
                .fromTo(
                    cloneGradient,
                    { x: dx, y: dy, scale: startScale },
                    { x: 0, y: 0, scale: 1, duration: PHASE_MORPH_END },
                    0,
                )
                .fromTo(
                    cloneGradient,
                    { opacity: 0 },
                    { opacity: 1, duration: PHASE_MORPH_END * 0.31 },
                    PHASE_MORPH_END * 0.77,
                )
                .fromTo(
                    clone,
                    { x: 0, y: 0, scale: 1 },
                    {
                        x: 0, y: liftY, scale: 1,
                        duration: PHASE_LIFT_END - PHASE_REST_END,
                        immediateRender: false,
                    },
                    PHASE_REST_END,
                )
                .fromTo(
                    cloneGradient,
                    { x: 0, y: 0, scale: 1 },
                    {
                        x: 0, y: liftY, scale: 1,
                        duration: PHASE_LIFT_END - PHASE_REST_END,
                        immediateRender: false,
                    },
                    PHASE_REST_END,
                )
                .fromTo(
                    featureBlock,
                    { autoAlpha: 0, y: 24 },
                    {
                        autoAlpha: 1, y: 0,
                        duration: PHASE_FEATURE_REVEAL_END - PHASE_FEATURE_REVEAL_START,
                        immediateRender: false,
                    },
                    PHASE_FEATURE_REVEAL_START,
                )
                .fromTo(
                    clone,
                    { x: 0, y: liftY, scale: 1 },
                    {
                        x: 0, y: finalY, scale: endScale,
                        duration: PHASE_SHRINK_END - PHASE_SHRINK_START,
                        ease: "sine.out",
                        immediateRender: false,
                    },
                    PHASE_SHRINK_START,
                )
                .fromTo(
                    cloneGradient,
                    { x: 0, y: liftY, scale: 1 },
                    {
                        x: 0, y: finalY, scale: endScale,
                        duration: PHASE_SHRINK_END - PHASE_SHRINK_START,
                        ease: "sine.out",
                        immediateRender: false,
                    },
                    PHASE_SHRINK_START,
                )
                .fromTo(
                    clone,
                    { y: finalY, autoAlpha: 1 },
                    {
                        y: exitY, autoAlpha: 0,
                        duration: PHASE_EXIT_END - PHASE_EXIT_START,
                        immediateRender: false,
                    },
                    PHASE_EXIT_START,
                )
                .fromTo(
                    cloneGradient,
                    { y: finalY, autoAlpha: 1 },
                    {
                        y: exitY, autoAlpha: 0,
                        duration: PHASE_EXIT_END - PHASE_EXIT_START,
                        immediateRender: false,
                    },
                    PHASE_EXIT_START,
                )
                .fromTo(
                    featureBlock,
                    { y: 0, scale: 1 },
                    {
                        y: featureExitY, scale: FEATURE_EXIT_SCALE,
                        duration: PHASE_EXIT_END - PHASE_EXIT_START,
                        immediateRender: false,
                    },
                    PHASE_EXIT_START,
                )
                .to({}, { duration: 1 }, 0);

        
        
        
            if (gallery) {
                tl.fromTo(
                    gallery,
                    { y: 0 },
                    {
                        y: gallerySlideY,
                        duration: PHASE_GALLERY_SLIDE_END - PHASE_GALLERY_SLIDE_START,
                        immediateRender: false,
                    },
                    PHASE_GALLERY_SLIDE_START,
                );
            }
        },
        { scope: wrapRef, dependencies: [reduced, enabled], revertOnUpdate: true },
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
        featureBlockRef,
    };
}
