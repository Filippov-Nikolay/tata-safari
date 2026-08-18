"use client";

import { AnimatePresence, m } from "framer-motion";
import { usePreloader } from "@/shared/providers";
import { siteConfig } from "@/shared/config/site.config";
import { TataLogoIcon } from "@/shared/ui";
import styles from "./Preloader.module.scss";

const EASE_OUT = [0.4, 0, 0.2, 1] as const;
const EASE_REVEAL = [0.16, 1, 0.3, 1] as const;

export function Preloader() {
    const { isShown, onExitComplete } = usePreloader();

    return (
        <AnimatePresence onExitComplete={onExitComplete}>
            {isShown && (
                <m.div
                    className={styles.overlay}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
                    transition={{ duration: 0.7, ease: EASE_OUT }}
                >
                    <m.p
                        className={styles.watermark}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.4, ease: EASE_OUT }}
                        aria-hidden="true"
                    >
                        {siteConfig.name}
                    </m.p>

                    <div className={styles.center}>
                        <div className={styles.mark}>
                            <svg className={styles.ring} viewBox="0 0 88 88" aria-hidden="true">
                                <circle className={styles.ringTrack} cx="44" cy="44" r="42" />
                                <m.circle
                                    className={styles.ringProgress}
                                    cx="44"
                                    cy="44"
                                    r="42"
                                    style={{ rotate: -90, transformOrigin: "50% 50%" }}
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.15, ease: EASE_REVEAL }}
                                />
                            </svg>

                            <m.div
                                className={styles.logo}
                                initial={{ opacity: 0, scale: 0.8, filter: "blur(14px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                transition={{ duration: 0.85, delay: 0.15, ease: EASE_REVEAL }}
                            >
                                <TataLogoIcon className={styles.logoIcon} />
                            </m.div>
                        </div>

                        {/* Wordmark, derived from siteConfig.name */}
                        <m.p
                            className={styles.name}
                            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.6, delay: 0.5, ease: EASE_REVEAL }}
                        >
                            {siteConfig.name}
                        </m.p>

                        {/* Progress bar */}
                        <m.div
                            className={styles.barTrack}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.65 }}
                        >
                            <m.div
                                className={styles.barFill}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                    duration: 1.3,
                                    delay: 0.75,
                                    ease: [0.25, 0.1, 0.25, 1],
                                }}
                            />
                        </m.div>
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );
}
