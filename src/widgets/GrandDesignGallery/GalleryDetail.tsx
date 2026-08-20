"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { useMounted } from "@/shared/hooks/useMounted";
import { useScrollLock } from "@/shared/hooks";
import { cn } from "@/shared/lib/cn";
import styles from "./GalleryDetail.module.scss";

export interface RectSnapshot {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface TileVisualSnapshot extends RectSnapshot {
    imageTransform: string;
    imageTransformOrigin: string;
    scrollY: number;
}

export interface GalleryDetailItem {
    key: string;
    src: string;
    title: string;
    text: string;
}

interface GalleryDetailProps {
    items: GalleryDetailItem[];
    startIndex: number | null;
    launchSnapshot: TileVisualSnapshot | null;
    getSnapshotForKey: (key: string) => TileVisualSnapshot | null;
    onClose: () => void;
    onBeforeClose?: (key: string) => void;
    onActiveKeyChange?: (key: string) => void;
    onReturnReady?: () => void;
    onExitComplete?: () => void;
    closeLabel: string;
}

const TILE_RADIUS_PX = 20;
const IMAGE_OPEN_TRANSITION = { duration: 1.08, ease: [0.22, 1, 0.36, 1] as const };
const IMAGE_CLOSE_TRANSITION = { duration: 1.02, ease: [0.65, 0, 0.25, 1] as const };
const DEPTH_TRANSITION = { duration: 0.58, ease: [0.22, 1, 0.36, 1] as const };
const BACKDROP_OPEN_TRANSITION = { duration: 0.34, delay: 0.74, ease: [0.22, 1, 0.36, 1] as const };
const BACKDROP_CLOSE_TRANSITION = { duration: 0.24, ease: [0.4, 0, 0.2, 1] as const };
const SCRIM_OPEN_TRANSITION = { duration: 0.38, delay: 0.86, ease: [0.22, 1, 0.36, 1] as const };
const SCRIM_CLOSE_TRANSITION = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };
const TEXT_OPEN_TRANSITION = { duration: 0.5, delay: 0.98, ease: [0.22, 1, 0.36, 1] as const };
const TEXT_STEP_TRANSITION = { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const };
const TEXT_CLOSE_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const };
const UI_OPEN_TRANSITION = { duration: 0.3, delay: 1.12, ease: [0.22, 1, 0.36, 1] as const };
const UI_CLOSE_TRANSITION = { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };
const DIVE_EXIT = { opacity: 0, scale: 0.4, filter: "blur(12px)" };
const DIVE_TRANSITION = { duration: 0.7, ease: [0.7, 0, 0.84, 0] as const };
const WHEEL_THRESHOLD = 12;
const STEP_LOCK_MS = 700;
const CLOSE_IMAGE_RETURN_DELAY_MS = 300;
const CLOSE_HANDOFF_DELAY_MS = 120;

type ScenePhase = "opening" | "open" | "closing";

function PresenceScrollLock({
    children,
    locked,
    scrollY,
}: {
    children: React.ReactNode;
    locked: boolean;
    scrollY?: number;
}) {
    useScrollLock(locked, { scrollY });
    return <>{children}</>;
}

function getViewportRect(): RectSnapshot {
    if (typeof window === "undefined") {
        return { top: 0, left: 0, width: 0, height: 0 };
    }

    return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

export function GalleryDetail({
    items,
    startIndex,
    launchSnapshot,
    getSnapshotForKey,
    onClose,
    onBeforeClose,
    onActiveKeyChange,
    onReturnReady,
    onExitComplete,
    closeLabel,
}: GalleryDetailProps) {
    const mounted = useMounted();
    const isOpen = startIndex !== null;
    const [currentIndex, setCurrentIndex] = useState(() => startIndex ?? 0);
    const [diving, setDiving] = useState(false);
    const [closing, setClosing] = useState(false);
    const [phase, setPhase] = useState<ScenePhase>(() => (launchSnapshot ? "opening" : "open"));
    const [closeTargetSnapshot, setCloseTargetSnapshot] = useState<TileVisualSnapshot | null>(null);
    const [viewportRect, setViewportRect] = useState<RectSnapshot>(() => getViewportRect());
    const [imageTransform, setImageTransform] = useState(
        () => launchSnapshot?.imageTransform ?? "none"
    );
    const [imageTransformOrigin, setImageTransformOrigin] = useState(
        () => launchSnapshot?.imageTransformOrigin ?? "50% 50%"
    );
    const [imageMotionTransition, setImageMotionTransition] = useState("none");
    const [releaseScrollLock, setReleaseScrollLock] = useState(false);
    const lockedRef = useRef(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const closeLeadTimeoutRef = useRef<number | null>(null);
    const closeHandoffTimeoutRef = useRef<number | null>(null);

    const current = items[currentIndex];
    const currentKey = current?.key;

    useEffect(() => {
        if (!mounted || !isOpen) return;

        const updateViewportRect = () => {
            setViewportRect(getViewportRect());
        };

        updateViewportRect();
        window.addEventListener("resize", updateViewportRect);

        return () => {
            window.removeEventListener("resize", updateViewportRect);
        };
    }, [isOpen, mounted]);

    useEffect(() => {
        if (!isOpen || !currentKey || !onActiveKeyChange) return;
        onActiveKeyChange(currentKey);
    }, [currentKey, isOpen, onActiveKeyChange]);

    useEffect(() => {
        return () => {
            if (closeLeadTimeoutRef.current !== null) {
                window.clearTimeout(closeLeadTimeoutRef.current);
            }

            if (closeHandoffTimeoutRef.current !== null) {
                window.clearTimeout(closeHandoffTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!diving) return;
        const id = requestAnimationFrame(() => onClose());
        return () => cancelAnimationFrame(id);
    }, [diving, onClose]);

    const sceneTargetRect = useMemo<RectSnapshot>(() => {
        if (phase === "closing" && closeTargetSnapshot) {
            return closeTargetSnapshot;
        }

        return viewportRect;
    }, [closeTargetSnapshot, phase, viewportRect]);

    useEffect(() => {
        if (phase !== "opening" || !launchSnapshot) return;

        let rafA = 0;
        let rafB = 0;

        rafA = requestAnimationFrame(() => {
            rafB = requestAnimationFrame(() => {
                setImageMotionTransition("transform 1080ms cubic-bezier(0.22, 1, 0.36, 1)");
                setImageTransform("none");
                setImageTransformOrigin("50% 50%");
            });
        });

        return () => {
            cancelAnimationFrame(rafA);
            cancelAnimationFrame(rafB);
        };
    }, [launchSnapshot, phase]);

    useEffect(() => {
        if (phase !== "open" || closing) return;

        const rafId = requestAnimationFrame(() => {
            setImageMotionTransition("none");
            setImageTransform("none");
            setImageTransformOrigin("50% 50%");
        });

        return () => cancelAnimationFrame(rafId);
    }, [closing, phase]);

    const requestClose = () => {
        if (closing || diving || !current) return;

        setClosing(true);

        if (closeLeadTimeoutRef.current !== null) {
            window.clearTimeout(closeLeadTimeoutRef.current);
        }

        onBeforeClose?.(current.key);

        const targetSnapshot = getSnapshotForKey(current.key) ?? launchSnapshot;
        setCloseTargetSnapshot(targetSnapshot);

        if (!targetSnapshot) {
            closeLeadTimeoutRef.current = window.setTimeout(() => {
                closeLeadTimeoutRef.current = null;
                onReturnReady?.();
                onClose();
            }, CLOSE_IMAGE_RETURN_DELAY_MS);
            return;
        }

        closeLeadTimeoutRef.current = window.setTimeout(() => {
            closeLeadTimeoutRef.current = null;

            onReturnReady?.();
            setImageMotionTransition("transform 980ms cubic-bezier(0.65, 0, 0.25, 1)");
            setImageTransformOrigin(targetSnapshot.imageTransformOrigin);
            setImageTransform(targetSnapshot.imageTransform);
            setPhase("closing");
        }, CLOSE_IMAGE_RETURN_DELAY_MS);
    };

    const goTo = (index: number) => {
        if (phase !== "open" || lockedRef.current || closing) return;

        if (index >= items.length || index < 0) {
            lockedRef.current = true;
            setDiving(true);

            window.setTimeout(() => {
                lockedRef.current = false;
            }, STEP_LOCK_MS);
            return;
        }

        if (index === currentIndex) return;

        lockedRef.current = true;
        setCurrentIndex(index);
        window.setTimeout(() => {
            lockedRef.current = false;
        }, STEP_LOCK_MS);
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                requestClose();
            } else if (phase === "open" && (e.key === "ArrowDown" || e.key === "PageDown")) {
                goTo(currentIndex + 1);
            } else if (phase === "open" && (e.key === "ArrowUp" || e.key === "PageUp")) {
                goTo(currentIndex - 1);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, phase, currentIndex, items.length, closing, diving]);

    useEffect(() => {
        if (!isOpen) return;
        const el = overlayRef.current;
        if (!el) return;

        const handleWheelNative = (e: WheelEvent) => {
            e.preventDefault();

            if (phase !== "open" || closing) return;

            const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            const delta = horizontal ? e.deltaX : e.deltaY;

            if (Math.abs(delta) < WHEEL_THRESHOLD) return;
            goTo(currentIndex + (delta > 0 ? 1 : -1));
        };

        el.addEventListener("wheel", handleWheelNative, { passive: false });
        return () => el.removeEventListener("wheel", handleWheelNative);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, phase, currentIndex, items.length, closing]);

    if (!mounted || !current) return null;

    return createPortal(
        <AnimatePresence onExitComplete={onExitComplete}>
            {isOpen && (
                <PresenceScrollLock locked={!releaseScrollLock} scrollY={launchSnapshot?.scrollY}>
                    <m.div
                        ref={overlayRef}
                        className={styles.overlay}
                        role="dialog"
                        aria-modal="true"
                        aria-label={current.title}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={
                            diving
                                ? { duration: 0.5, delay: 0.35, ease: "easeOut" }
                                : { duration: 0.18, ease: "easeOut" }
                        }
                    >
                        <m.div
                            className={styles.backdrop}
                            aria-hidden="true"
                            initial={{ opacity: 0 }}
                            animate={closing ? { opacity: 0 } : { opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={
                                phase === "opening"
                                    ? BACKDROP_OPEN_TRANSITION
                                    : closing
                                      ? BACKDROP_CLOSE_TRANSITION
                                      : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
                            }
                        />

                        <m.div
                            className={styles.imageWrap}
                            initial={
                                launchSnapshot
                                    ? {
                                          top: launchSnapshot.top,
                                          left: launchSnapshot.left,
                                          width: launchSnapshot.width,
                                          height: launchSnapshot.height,
                                          borderRadius: TILE_RADIUS_PX,
                                      }
                                    : false
                            }
                            animate={{
                                top: sceneTargetRect.top,
                                left: sceneTargetRect.left,
                                width: sceneTargetRect.width,
                                height: sceneTargetRect.height,
                                borderRadius: phase === "closing" ? TILE_RADIUS_PX : 0,
                            }}
                            transition={
                                phase === "closing" ? IMAGE_CLOSE_TRANSITION : IMAGE_OPEN_TRANSITION
                            }
                            onAnimationComplete={() => {
                                if (phase === "opening") {
                                    setPhase("open");
                                } else if (phase === "closing") {
                                    if (closeHandoffTimeoutRef.current !== null) return;

                                    setReleaseScrollLock(true);
                                    closeHandoffTimeoutRef.current = window.setTimeout(() => {
                                        closeHandoffTimeoutRef.current = null;
                                        onClose();
                                    }, CLOSE_HANDOFF_DELAY_MS);
                                }
                            }}
                        >
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={current.key}
                                    className={styles.depthLayer}
                                    initial={
                                        phase === "opening" ? false : { opacity: 0, scale: 1.05 }
                                    }
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={diving ? DIVE_EXIT : { opacity: 0, scale: 0.97 }}
                                    transition={diving ? DIVE_TRANSITION : DEPTH_TRANSITION}
                                >
                                    <div
                                        className={styles.imageMotionLayer}
                                        style={{
                                            transform: imageTransform,
                                            transformOrigin: imageTransformOrigin,
                                            transition: imageMotionTransition,
                                        }}
                                    >
                                        <Image
                                            src={current.src}
                                            alt={current.title}
                                            fill
                                            sizes="100vw"
                                            className={styles.image}
                                            priority
                                        />
                                    </div>
                                </m.div>
                            </AnimatePresence>
                        </m.div>

                        <m.div
                            className={styles.scrim}
                            aria-hidden="true"
                            initial={{ opacity: 0 }}
                            animate={closing ? { opacity: 0 } : { opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={
                                closing
                                    ? SCRIM_CLOSE_TRANSITION
                                    : phase === "opening"
                                      ? SCRIM_OPEN_TRANSITION
                                      : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
                            }
                        />

                        <AnimatePresence mode="wait">
                            <m.div
                                key={current.key}
                                className={styles.textBlock}
                                initial={
                                    phase === "opening"
                                        ? { opacity: 0, y: 32, filter: "blur(22px)" }
                                        : { opacity: 0, y: 18, filter: "blur(14px)" }
                                }
                                animate={
                                    closing
                                        ? { opacity: 0, y: -26, filter: "blur(12px)" }
                                        : { opacity: 1, y: 0, filter: "blur(0px)" }
                                }
                                exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
                                transition={
                                    closing
                                        ? TEXT_CLOSE_TRANSITION
                                        : phase === "opening"
                                          ? TEXT_OPEN_TRANSITION
                                          : TEXT_STEP_TRANSITION
                                }
                            >
                                <h2 className={styles.title}>{current.title}</h2>
                                <p className={styles.text}>{current.text}</p>
                            </m.div>
                        </AnimatePresence>

                        <m.button
                            className={styles.close}
                            onClick={requestClose}
                            aria-label={closeLabel}
                            autoFocus
                            initial={
                                phase === "opening" ? { opacity: 0, scale: 0.92, y: -10 } : false
                            }
                            animate={
                                closing
                                    ? { opacity: 0, scale: 0.92, y: -10 }
                                    : { opacity: 1, scale: 1, y: 0 }
                            }
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={
                                closing
                                    ? UI_CLOSE_TRANSITION
                                    : phase === "opening"
                                      ? UI_OPEN_TRANSITION
                                      : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
                            }
                        >
                            &times;
                        </m.button>

                        {items.length > 1 && (
                            <m.div
                                className={styles.dots}
                                initial={phase === "opening" ? { opacity: 0, y: 10 } : false}
                                animate={closing ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={
                                    closing
                                        ? UI_CLOSE_TRANSITION
                                        : phase === "opening"
                                          ? UI_OPEN_TRANSITION
                                          : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
                                }
                            >
                                {items.map((it, i) => (
                                    <button
                                        key={it.key}
                                        type="button"
                                        aria-label={it.title}
                                        aria-current={i === currentIndex}
                                        className={cn(
                                            styles.dot,
                                            i === currentIndex && styles.dotActive
                                        )}
                                        onClick={() => goTo(i)}
                                    />
                                ))}
                            </m.div>
                        )}
                    </m.div>
                </PresenceScrollLock>
            )}
        </AnimatePresence>,
        document.body
    );
}
