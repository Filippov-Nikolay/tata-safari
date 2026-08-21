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
            const wordVisible =
                safariWord && window.getComputedStyle(safariWord).display !== "none";

            if (reduced) {
                gsap.set(
                    [
                        safariWord,
                        carLayer,
                        carMotion,
                        carReveal,
                        eyebrow,
                        title,
                        description,
                        cta,
                    ].filter(Boolean),
                    {
                        clearProps: "all",
                    }
                );
                return;
            }

            // ============================================================
            // Two independent animations live here:
            //
            // 1. A "reveal" timeline (revealTl below) - a staggered
            //    fade/rise/unblur of every element, back-to-front (car and
            //    watermark first, text and CTA last). It isn't driven by
            //    ScrollTrigger's own scrub; its progress (0-1) is computed by
            //    hand every tick from the stage's position (see
            //    updateRevealProgress) and smoothed with gsap.quickTo, which
            //    gives it a softer, slightly lagging feel instead of being
            //    rigidly locked to the scroll position.
            //
            // 2. A real ScrollTrigger-scrubbed parallax on the car layer
            //    itself (see the gsap.to(carMotion, ...) call near the
            //    bottom), running the whole time the footer stage is in the
            //    viewport, independent of the reveal above.
            // ============================================================

            // --- Initial (hidden) state for every element the reveal
            // timeline will animate from. ---
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
                y: compact ? 36 : 48,
                scale: 0.94,
                filter: "blur(16px)",
            });

            // paused: true - this timeline is never played on its own; its
            // .progress() is driven manually below (see syncReveal), so all
            // the start-time offsets that follow are positions along a 0-1
            // scrubbable timeline, not real-time delays.
            const revealTl = gsap.timeline({
                paused: true,
                defaults: {
                    ease: "power3.out",
                    force3D: true,
                },
            });

            // Phase 1 - background, starts almost immediately (offsets
            // 0.02-0.1) and runs longest (0.9-1.18): the car's wrapper fades
            // in while the car image itself glides into place, sharpening
            // from a dark, blurred, offset "deep background" look to fully
            // in focus. The "SAFARI" watermark word (desktop layout only -
            // wordVisible checks it's actually rendered) fades/drops/
            // unblurs into place alongside it. These are the visually
            // heaviest elements, so they get a slow start-to-settle feel.
            revealTl.to(
                carLayer,
                {
                    autoAlpha: 1,
                    duration: 0.9,
                },
                0.08
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
                0.1
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
                    0.02
                );
            }

            // Phase 2 - foreground copy, staggered progressively later
            // (0.24 -> 0.32 -> 0.46 -> 0.48) with shorter durations: eyebrow
            // label, heading, paragraph and CTA button each fade/rise/unblur
            // into place in reading order, cascading in front of the
            // background layer above rather than all arriving at once.
            revealTl
                .to(
                    eyebrow,
                    {
                        autoAlpha: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 0.6,
                    },
                    0.24
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
                    0.32
                )
                .to(
                    description,
                    {
                        autoAlpha: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 0.82,
                    },
                    0.46
                )
                .to(
                    cta,
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 0.72,
                        ease: "power2.out",
                    },
                    0.48
                );

            // Start the reveal fully hidden (progress 0 = every gsap.set
            // state above).
            revealTl.progress(0);

            // --- Driving the reveal timeline by hand instead of a plain
            // ScrollTrigger scrub ---
            // Each tick (gsap.ticker below), updateRevealProgress works out
            // how far the stage has traveled through its own reveal window
            // (startPx -> endPx, a viewport-relative band above the fold)
            // as a raw 0-1 linearProgress, then reshapes that with
            // Math.pow(..., 1.45/1.62) so the reveal starts slowly and
            // accelerates - a plain linear scrub felt too even/mechanical
            // here. That reshaped value is the *target*; gsap.quickTo
            // (tweenRevealProgress) eases revealState.progress toward it
            // over 0.42-0.56s instead of snapping to it immediately, which
            // is what gives the whole reveal its slightly soft, trailing
            // feel rather than being rigidly pinned to the scroll position
            // frame-by-frame. onUpdate (syncReveal) pushes that eased value
            // into revealTl.progress() on every step.
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
                const startPx = viewportHeight * (compact ? 0.78 : 0.68);
                const endPx = viewportHeight * (compact ? 0.24 : -0.1);
                const linearProgress = gsap.utils.clamp(
                    0,
                    1,
                    (startPx - stageTop) / Math.max(startPx - endPx, 1)
                );
                const nextProgress = Math.pow(linearProgress, compact ? 1.45 : 1.62);

                // Skip re-tweening toward a target that's barely moved -
                // this runs on every ticker frame, so this guard is what
                // keeps it cheap while idle/off-screen.
                if (Math.abs(nextProgress - lastRevealProgress) < 0.001) {
                    return;
                }

                lastRevealProgress = nextProgress;
                tweenRevealProgress(nextProgress);
            };

            // Set the correct progress immediately too (e.g. landing already
            // scrolled past the reveal band shouldn't require a scroll event
            // first), then keep it live every frame via the ticker.
            updateRevealProgress();

            const updateFooterAnimations = () => {
                updateRevealProgress();
            };

            gsap.ticker.add(updateFooterAnimations);

            // --- Separate from the reveal above: a real ScrollTrigger
            // parallax on the car layer, scrubbing continuously (with a
            // little scrub-smoothing lag of its own, 1.2-1.5s) for as long
            // as the stage is anywhere in the viewport at all ("top bottom"
            // to "bottom top" - the full pass-through range), independent of
            // whatever the reveal timeline above is doing. ---
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
        { scope: footerRef, dependencies: [reduced, enabled], revertOnUpdate: true }
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
