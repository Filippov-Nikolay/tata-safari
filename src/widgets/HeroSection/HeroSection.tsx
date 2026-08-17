"use client";

import { useState } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Section, ArrowIcon } from "@/shared/ui";
import { useMotionVariants } from "@/shared/hooks/useMotionVariants";
import { fadeIn } from "@/shared/lib/motion/fade-in";
import { usePreloader } from "@/shared/providers";
import { cn } from "@/shared/lib/cn";
import { useHeroSectionAnimations } from "./useHeroSectionAnimations";
import styles from "./HeroSection.module.scss";

export function HeroSection() {
    const t = useTranslations("hero");
    const safeFadeIn = useMotionVariants(fadeIn);
    const { isReady } = usePreloader();
    const [skyLoaded, setSkyLoaded] = useState(false);
    const [carLoaded, setCarLoaded] = useState(false);

    const {
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
    } = useHeroSectionAnimations(isReady);

    return (
        <Section id="overview" className={styles.sectionReset}>
            <div className={styles.wrap} ref={wrapRef}>
                <div className={styles.stage} ref={stageRef}>
                    <div className={styles.background} aria-hidden="true">
                        <div className={styles.skyLayer} ref={skyRef}>
                            <Image
                                src="/hero/sky.png"
                                alt=""
                                fill
                                priority
                                sizes="100vw"
                                onLoad={() => setSkyLoaded(true)}
                                className={cn(styles.layerImage, skyLoaded && styles.layerImageLoaded)}
                            />
                        </div>
                        <div className={styles.carLayer} ref={carRef}>
                            <Image
                                src="/hero/car-dirt.png"
                                alt=""
                                fill
                                priority
                                sizes="100vw"
                                onLoad={() => setCarLoaded(true)}
                                className={cn(styles.layerImage, carLoaded && styles.layerImageLoaded)}
                            />
                        </div>
                        <div className={styles.scrim} ref={scrimRef} />
                        {/* Fully opaque — hides the photo completely once
                            landed, so the resting state reads as a real flat
                            dark section rather than a dimmed photo. */}
                        <div className={styles.solid} ref={solidRef} />
                    </div>

                    <div className={styles.inner}>
                        <m.div
                            className={styles.copy}
                            ref={copyRef}
                            variants={safeFadeIn}
                            initial="hidden"
                            animate={isReady ? "visible" : "hidden"}
                        >
                            <h1 className={styles.title}>
                                {t.rich("title", {
                                    safari: (chunks) => (
                                        <span ref={ghostRef} className={styles.ghost}>
                                            {chunks}
                                        </span>
                                    ),
                                })}
                            </h1>

                            <p className={styles.description}>{t("description")}</p>

                            <a href="#" className={styles.ctaBtn}>
                                <span className={styles.ctaText}>{t("cta")}</span>
                                <span className={styles.ctaCircle} aria-hidden="true">
                                    {/* Two arrows in a sliding track: on hover the
                                        track shifts by one slot, so the resting
                                        arrow rides out one side while its twin
                                        rides in from the other to take its place. */}
                                    <span className={styles.arrowTrack}>
                                        <span className={styles.arrowSlot}>
                                            <ArrowIcon className={styles.ctaArrow} />
                                        </span>
                                        <span className={styles.arrowSlot}>
                                            <ArrowIcon className={styles.ctaArrow} />
                                        </span>
                                    </span>
                                </span>
                            </a>
                        </m.div>
                    </div>

                    {/* Decorative — the real "Safari" text lives in the h1 above.
                        These two share one CSS class so their geometry always
                        matches: endGhost (invisible) marks the landing spot used
                        to measure the scroll-scrubbed animation, clone is what's
                        actually shown, flying from the headline to this spot. */}
                    <div
                        className={cn(styles.safariClone, styles.measureGhost)}
                        ref={endGhostRef}
                        aria-hidden="true"
                    >
                        {t("safariWord")}
                    </div>
                    <m.div
                        className={styles.safariClone}
                        ref={cloneRef}
                        variants={safeFadeIn}
                        initial="hidden"
                        animate={isReady ? "visible" : "hidden"}
                        aria-hidden="true"
                    >
                        {t("safariWord")}
                    </m.div>
                    {/* Stacked on top of clone, sharing its transform — fades
                        in as the word settles so the resting word reads as a
                        gradient sweep instead of flat color. */}
                    <div
                        className={cn(styles.safariClone, styles.safariCloneGradient)}
                        ref={cloneGradientRef}
                        aria-hidden="true"
                    >
                        {t("safariWord")}
                    </div>

                    <div className={styles.featureBlock} ref={featureBlockRef}>
                        <h2 className={styles.featureTitle}>{t("featureTitle")}</h2>
                        <p className={styles.featureDescription}>{t("featureDescription")}</p>
                    </div>
                </div>
            </div>
        </Section>
    );
}
