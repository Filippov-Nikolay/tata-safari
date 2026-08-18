"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useScrollTriggerAutoRefresh } from "@/shared/hooks";
import { useGSAP, gsap } from "@/shared/lib/gsap";

const isCompact = () => window.matchMedia("(max-width: 767px)").matches;

export function useFooterAnimations(enabled = true) {
    const reduced = useReducedMotion();

    useScrollTriggerAutoRefresh([reduced, enabled]);

    const footerRef = useRef<HTMLElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const safariWordRef = useRef<HTMLParagraphElement>(null);
    const carLayerRef = useRef<HTMLDivElement>(null);
    const carMotionRef = useRef<HTMLDivElement>(null);
    const carRevealRef = useRef<HTMLDivElement>(null);
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLAnchorElement>(null);

    useGSAP(
        () => {
            const footer = footerRef.current;
            const stage = stageRef.current;
            const safariWord = safariWordRef.current;
            const carLayer = carLayerRef.current;
            const carMotion = carMotionRef.current;
            const carReveal = carRevealRef.current;
            const eyebrow = eyebrowRef.current;
            const title = titleRef.current;
            const description = descriptionRef.current;
            const cta = ctaRef.current;

            if (
                !footer ||
                !stage ||
                !carLayer ||
                !carMotion ||
                !carReveal ||
                !eyebrow ||
                !title ||
                !description ||
                !cta
            ) {
                return;
            }

            if (!enabled) {
                return;
            }

            const compact = isCompact();
            const wordVisible = safariWord && window.getComputedStyle(safariWord).display !== "none";

            if (reduced) {
                gsap.set([safariWord, carLayer, carMotion, carReveal, eyebrow, title, description, cta].filter(Boolean), {
                    clearProps: "all",
                });
                return;
            }

            gsap.set(carLayer, {
                autoAlpha: 0,
            });

            gsap.set(carMotion, {
                y: 0,
                scale: 1,
            });

            gsap.set(carReveal, {
                x: compact ? 12 : 20,
                y: compact ? 26 : 38,
                scale: compact ? 1.04 : 1.03,
                filter: "blur(18px) brightness(0.62) saturate(0.84)",
            });

            if (wordVisible && safariWord) {
                gsap.set(safariWord, {
                    autoAlpha: 0,
                    y: compact ? -98 : -188,
                    scale: compact ? 0.956 : 0.9,
                    filter: "blur(38px)",
                });
            }

            gsap.set(eyebrow, {
                autoAlpha: 0,
                y: compact ? 50 : 72,
                filter: "blur(20px)",
            });

            gsap.set(title, {
                autoAlpha: 0,
                y: compact ? 66 : 104,
                scale: 0.95,
                filter: "blur(28px)",
            });

            gsap.set(description, {
                autoAlpha: 0,
                y: compact ? 54 : 76,
                filter: "blur(20px)",
            });

            gsap.set(cta, {
                autoAlpha: 0,
                y: compact ? 52 : 72,
                scale: 0.88,
                filter: "blur(24px)",
            });

            const revealTl = gsap.timeline({
                paused: true,
                defaults: {
                    ease: "power3.out",
                    force3D: true,
                },
            });

            revealTl.to(
                carLayer,
                {
                    autoAlpha: 1,
                    duration: 0.9,
                },
                0.08,
            );

            revealTl.to(
                carReveal,
                {
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px) brightness(1) saturate(1)",
                    duration: 1.18,
                },
                0.1,
            );

            if (wordVisible && safariWord) {
                revealTl.to(
                    safariWord,
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 1.16,
                    },
                    0.02,
                );
            }

            revealTl
                .to(
                eyebrow,
                {
                    autoAlpha: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.6,
                },
                0.24,
            )
                .to(
                    title,
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 0.94,
                    },
                    0.32,
                )
                .to(
                    description,
                    {
                        autoAlpha: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 0.82,
                    },
                    0.46,
                )
                .to(
                    cta,
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 0.78,
                    },
                    0.58,
                );

            revealTl.progress(0);

            let lastRevealProgress = -1;
            const revealState = { progress: 0 };
            const syncReveal = () => {
                revealTl.progress(revealState.progress);
            };
            const tweenRevealProgress = gsap.quickTo(revealState, "progress", {
                duration: compact ? 0.42 : 0.56,
                ease: "power2.out",
                onUpdate: syncReveal,
            });

            const updateRevealProgress = () => {
                const viewportHeight = window.innerHeight || 1;
                const stageTop = stage.getBoundingClientRect().top;
                const startPx = viewportHeight * (compact ? 0.76 : 0.68);
                const endPx = viewportHeight * (compact ? -0.04 : -0.1);
                const linearProgress = gsap.utils.clamp(
                    0,
                    1,
                    (startPx - stageTop) / Math.max(startPx - endPx, 1),
                );
                const nextProgress = Math.pow(linearProgress, compact ? 1.45 : 1.62);

                if (Math.abs(nextProgress - lastRevealProgress) < 0.001) {
                    return;
                }

                lastRevealProgress = nextProgress;
                tweenRevealProgress(nextProgress);
            };

            updateRevealProgress();

            const updateFooterAnimations = () => {
                updateRevealProgress();
            };

            gsap.ticker.add(updateFooterAnimations);

            gsap.to(carMotion, {
                y: compact ? -10 : -16,
                scale: compact ? 1.012 : 1.018,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                    trigger: stage,
                    start: compact ? "top bottom" : "top bottom",
                    end: compact ? "bottom top" : "bottom top",
                    scrub: compact ? 1.2 : 1.5,
                    invalidateOnRefresh: true,
                },
            });

            return () => {
                gsap.ticker.remove(updateFooterAnimations);
            };
        },
        { scope: footerRef, dependencies: [reduced, enabled], revertOnUpdate: true },
    );

    return {
        footerRef,
        stageRef,
        safariWordRef,
        carLayerRef,
        carMotionRef,
        carRevealRef,
        eyebrowRef,
        titleRef,
        descriptionRef,
        ctaRef,
    };
}
