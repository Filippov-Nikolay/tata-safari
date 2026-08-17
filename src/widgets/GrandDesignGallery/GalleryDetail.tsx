"use client";

import { useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { useMounted } from "@/shared/hooks/useMounted";
import styles from "./GalleryDetail.module.scss";

export interface GalleryDetailItem {
    key: string;
    src: string;
    title: string;
    text: string;
}

interface GalleryDetailProps {
    item: GalleryDetailItem | null;
    onClose: () => void;
    closeLabel: string;
    imageRatio: number;
}

const IMAGE_TRANSITION = { duration: 1, ease: [0.16, 1, 0.3, 1] as const };
const TEXT_TRANSITION = { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: 0.55 };

export function GalleryDetail({ item, onClose, closeLabel, imageRatio }: GalleryDetailProps) {
    const mounted = useMounted();

    useEffect(() => {
        if (!item) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [item, onClose]);

    useEffect(() => {
        document.body.style.overflow = item ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [item]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {item && (
                <m.div
                    key={item.key}
                    className={styles.overlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label={item.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <button className={styles.close} onClick={onClose} aria-label={closeLabel} autoFocus>
                        &times;
                    </button>

                    <m.div
                        className={styles.imageWrap}
                        layoutId={`gallery-image-${item.key}`}
                        transition={IMAGE_TRANSITION}
                        style={{ aspectRatio: imageRatio }}
                    >
                        <Image
                            src={item.src}
                            alt={item.title}
                            fill
                            sizes="100vw"
                            className={styles.image}
                            priority
                        />
                    </m.div>

                    <div className={styles.scrim} aria-hidden="true" />

                    <m.div
                        className={styles.textBlock}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 14 }}
                        transition={TEXT_TRANSITION}
                    >
                        <h2 className={styles.title}>{item.title}</h2>
                        <p className={styles.text}>{item.text}</p>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
