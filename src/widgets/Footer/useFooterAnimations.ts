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
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLAnchorElement>(null);

    useGSAP(
        () => {
            const footer = footerRef.current;
            const stage = stageRef.current;
            const safariWord = safariWordRef.current;
            const eyebrow = eyebrowRef.current;
            const title = titleRef.current;
            const description = descriptionRef.current;
            const cta = ctaRef.current;

            if (!footer || !stage || !eyebrow || !title || !description || !cta) {
                return;
            }

            if (!enabled) {
                return;
            }

            const compact = isCompact();
            const wordVisible = safariWord && window.getComputedStyle(safariWord).display !== "none";

            if (reduced) {
                gsap.set([safariWord, eyebrow, title, description, cta].filter(Boolean), {
                    clearProps: "all",
                });
                return;
            }

            if (wordVisible && safariWord) {
                gsap.set(safariWord, {
                    autoAlpha: 0,
                    y: compact ? -56 : -116,
                    scale: compact ? 0.96 : 0.9,
                    filter: "blur(28px)",
                });
            }

            gsap.set(eyebrow, {
                autoAlpha: 0,
                y: compact ? 26 : 42,
                filter: "blur(12px)",
            });

            gsap.set(title, {
                autoAlpha: 0,
                y: compact ? 34 : 62,
                scale: 0.97,
                filter: "blur(16px)",
            });

            gsap.set(description, {
                autoAlpha: 0,
                y: compact ? 28 : 46,
                filter: "blur(12px)",
            });

            gsap.set(cta, {
                autoAlpha: 0,
                y: compact ? 22 : 40,
                scale: 0.92,
                filter: "blur(14px)",
            });

            const tl = gsap.timeline({
                defaults: {
                    ease: "power3.out",
                    force3D: true,
                },
                scrollTrigger: {
                    trigger: stage,
                    start: compact ? "top 80%" : "top 70%",
                    end: compact ? "top 38%" : "top 22%",
                    scrub: compact ? 1 : 1.15,
                    invalidateOnRefresh: true,
                },
            });

            if (wordVisible && safariWord) {
                tl.to(
                    safariWord,
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 1.05,
                    },
                    0,
                );
            }

            tl.to(
                eyebrow,
                {
                    autoAlpha: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.48,
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
                        duration: 0.82,
                    },
                    0.34,
                )
                .to(
                    description,
                    {
                        autoAlpha: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 0.68,
                    },
                    0.5,
                )
                .to(
                    cta,
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 0.62,
                    },
                    0.62,
                );
        },
        { scope: footerRef, dependencies: [reduced, enabled], revertOnUpdate: true },
    );

    return {
        footerRef,
        stageRef,
        safariWordRef,
        eyebrowRef,
        titleRef,
        descriptionRef,
        ctaRef,
    };
}
