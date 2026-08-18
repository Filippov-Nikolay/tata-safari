"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { useMounted } from "@/shared/hooks/useMounted";
import { useLenis } from "@/shared/providers";
import { cn } from "@/shared/lib/cn";
import styles from "./GalleryDetail.module.scss";

export interface GalleryDetailItem {
    key: string;
    src: string;
    title: string;
    text: string;
}

interface GalleryDetailProps {
    items: GalleryDetailItem[];
    startIndex: number | null;
    originKey: string | null;
    onClose: () => void;
    closeLabel: string;
}

const IMAGE_FLIP_TRANSITION = { duration: 1, ease: [0.16, 1, 0.3, 1] as const };
const DEPTH_TRANSITION = { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const };
const TEXT_TRANSITION = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };
const DIVE_EXIT = { opacity: 0, scale: 0.4, filter: "blur(12px)" };
const DIVE_TRANSITION = { duration: 0.7, ease: [0.7, 0, 0.84, 0] as const };
const WHEEL_THRESHOLD = 12;
const STEP_LOCK_MS = 700;

export function GalleryDetail({
    items,
    startIndex,
    originKey,
    onClose,
    closeLabel,
}: GalleryDetailProps) {
    const mounted = useMounted();
    const isOpen = startIndex !== null;
    const [currentIndex, setCurrentIndex] = useState(() => startIndex ?? 0);
    const [diving, setDiving] = useState(false);
    const lockedRef = useRef(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!diving) return;
        const id = requestAnimationFrame(() => onClose());
        return () => cancelAnimationFrame(id);
    }, [diving, onClose]);

    const goTo = (index: number) => {
        if (lockedRef.current) return;

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
                onClose();
            } else if (e.key === "ArrowDown" || e.key === "PageDown") {
                goTo(currentIndex + 1);
            } else if (e.key === "ArrowUp" || e.key === "PageUp") {
                goTo(currentIndex - 1);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, onClose, currentIndex, items.length]);

    const lenis = useLenis();

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        if (isOpen) {
            lenis?.stop();
        } else {
            lenis?.start();
        }
        return () => {
            document.body.style.overflow = "";
            lenis?.start();
        };
    }, [isOpen, lenis]);

    useEffect(() => {
        if (!isOpen) return;
        const el = overlayRef.current;
        if (!el) return;

        const handleWheelNative = (e: WheelEvent) => {
            e.preventDefault();

            const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            const delta = horizontal ? e.deltaX : e.deltaY;

            if (Math.abs(delta) < WHEEL_THRESHOLD) return;
            goTo(currentIndex + (delta > 0 ? 1 : -1));
        };

        el.addEventListener("wheel", handleWheelNative, { passive: false });
        return () => el.removeEventListener("wheel", handleWheelNative);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentIndex, items.length]);

    if (!mounted) return null;

    const current = items[currentIndex];

    return createPortal(
        <AnimatePresence>
            {isOpen && current && (
                <m.div
                    ref={overlayRef}
                    className={styles.overlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label={current.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={
                        diving
                            ? { duration: 0.5, delay: 0.35, ease: "easeOut" }
                            : { duration: 0.4, ease: "easeOut" }
                    }
                >
                    <button className={styles.close} onClick={onClose} aria-label={closeLabel} autoFocus>
                        &times;
                    </button>

                    <m.div
                        className={styles.imageWrap}
                        layoutId={!diving && originKey ? `gallery-image-${originKey}` : undefined}
                        transition={IMAGE_FLIP_TRANSITION}
                    >
                        <AnimatePresence mode="wait">
                            <m.div
                                key={current.key}
                                className={styles.depthLayer}
                                initial={{ opacity: 0, scale: 1.18 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={diving ? DIVE_EXIT : { opacity: 0, scale: 0.82 }}
                                transition={diving ? DIVE_TRANSITION : DEPTH_TRANSITION}
                            >
                                <Image
                                    src={current.src}
                                    alt={current.title}
                                    fill
                                    sizes="100vw"
                                    className={styles.image}
                                    priority
                                />
                            </m.div>
                        </AnimatePresence>
                    </m.div>

                    <div className={styles.scrim} aria-hidden="true" />

                    <AnimatePresence mode="wait">
                        <m.div
                            key={current.key}
                            className={styles.textBlock}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={TEXT_TRANSITION}
                        >
                            <h2 className={styles.title}>{current.title}</h2>
                            <p className={styles.text}>{current.text}</p>
                        </m.div>
                    </AnimatePresence>

                    {items.length > 1 && (
                        <div className={styles.dots}>
                            {items.map((it, i) => (
                                <button
                                    key={it.key}
                                    type="button"
                                    aria-label={it.title}
                                    aria-current={i === currentIndex}
                                    className={cn(styles.dot, i === currentIndex && styles.dotActive)}
                                    onClick={() => goTo(i)}
                                />
                            ))}
                        </div>
                    )}
                </m.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
