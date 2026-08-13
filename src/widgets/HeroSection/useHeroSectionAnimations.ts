"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP, gsap } from "@/shared/lib/gsap";
import { useScrollTriggerAutoRefresh } from "@/shared/hooks";

const SAFARI_GOLD = "#D9AE73";

const isCompact = () => window.matchMedia("(max-width: 768px)").matches;

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

    useGSAP(
        () => {
            const wrap = wrapRef.current;
            const sky = skyRef.current;
            const car = carRef.current;
            const scrim = scrimRef.current;
            const solid = solidRef.current;
            const copy = copyRef.current;
            const ghost = ghostRef.current;
            const clone = cloneRef.current;
            const cloneGradient = cloneGradientRef.current;
            const endGhost = endGhostRef.current;

            if (
                !wrap || !sky || !car || !scrim || !solid || !copy || !ghost ||
                !clone || !cloneGradient || !endGhost
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

            gsap.set(ghost, { autoAlpha: 0 });
            gsap.set([clone, cloneGradient], {
                xPercent: -50,
                yPercent: -50,
                transformOrigin: "50% 50%",
            });
            gsap.set(cloneGradient, { opacity: 0 });

            gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    trigger: wrap,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                },
            })
                .fromTo(
                    car,
                    { yPercent: 0, scale: 1 },
                    { yPercent: -26, scale: 1.06, duration: 0.65 },
                    0,
                )
                .fromTo(sky, { yPercent: 0 }, { yPercent: -9, duration: 0.65 }, 0)
                .fromTo(scrim, { opacity: 0.12 }, { opacity: 1, duration: 0.45 }, 0.1)
                .fromTo(solid, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.2)
                .fromTo(
                    copy,
                    { autoAlpha: 1, y: 0 },
                    { autoAlpha: 0, y: -36, duration: 0.28 },
                    0,
                )
                .fromTo(
                    clone,
                    { x: dx, y: dy, scale: startScale, color: "#ffffff" },
                    { x: 0, y: 0, scale: 1, color: SAFARI_GOLD, duration: 0.65 },
                    0,
                )
                .fromTo(
                    cloneGradient,
                    { x: dx, y: dy, scale: startScale },
                    { x: 0, y: 0, scale: 1, duration: 0.65 },
                    0,
                )
                .fromTo(cloneGradient, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.5)
                .to({}, { duration: 1 }, 0);
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
    };
}
