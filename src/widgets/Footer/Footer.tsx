"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowIcon } from "@/shared/ui";
import { useBookingModalActions, useLenis } from "@/shared/providers";
import { useFooterAnimations } from "./useFooterAnimations";
import styles from "./Footer.module.scss";

const LEGAL_LINKS = ["contact", "careers", "media", "legal", "privacy", "terms"] as const;
const FOOTER_BG_SRC = "/footer/bg.png?v=20260818-1454";
const FOOTER_CAR_SRC = "/footer/car.png?v=20260818-1454";

export function Footer() {
    const t = useTranslations("footer");
    const year = new Date().getFullYear();
    const { open: openBooking } = useBookingModalActions();
    const lenis = useLenis();
    const {
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
    } = useFooterAnimations();

    const handleOpenBooking = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        const frozenScrollY = Math.round(window.scrollY);
        lenis?.scrollTo(frozenScrollY, { immediate: true, force: true });
        lenis?.stop();
        openBooking();
    }, [lenis, openBooking]);

    return (
        <footer ref={footerRef} className={styles.footer}>
            <div ref={stageRef} className={styles.stage}>
                <div className={styles.background} aria-hidden="true">
                    <Image
                        src={FOOTER_BG_SRC}
                        alt=""
                        fill
                        sizes="100vw"
                        className={styles.bgImage}
                        unoptimized
                    />
                    <p ref={safariWordRef} className={styles.safariWord} aria-hidden="true">
                        SAFARI
                    </p>
                    <div ref={carLayerRef} className={styles.carLayer}>
                        <div ref={carMotionRef} className={styles.carMotion}>
                            <div ref={carRevealRef} className={styles.carReveal}>
                                <Image
                                    src={FOOTER_CAR_SRC}
                                    alt=""
                                    fill
                                    sizes="100vw"
                                    className={styles.carImage}
                                    unoptimized
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.scrim} />
                </div>

                <div className={styles.inner}>
                    <p ref={eyebrowRef} className={styles.eyebrow}>
                        {t("eyebrow")}
                    </p>
                    <h2 ref={titleRef} className={styles.title}>
                        {t("title")}
                    </h2>
                    <p ref={descriptionRef} className={styles.description}>
                        {t("description")}
                    </p>

                    <a
                        ref={ctaRef}
                        href="#"
                        className={styles.ctaBtn}
                        onClick={handleOpenBooking}
                    >
                        <span>{t("cta")}</span>
                        <span className={styles.ctaCircle} aria-hidden="true">
                            <ArrowIcon className={styles.ctaArrow} />
                        </span>
                    </a>
                </div>
            </div>

            <div className={styles.legal}>
                <div className={styles.legalInner}>
                    <span className={styles.brand}>{t("brand")}</span>

                    <nav aria-label="Legal">
                        <ul className={styles.legalNav}>
                            {LEGAL_LINKS.map((key) => (
                                <li key={key}>
                                    <a href="#">{t(`nav.${key}`)}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <p className={styles.copyright}>
                        {"\u00A9"} {year} {t("brand")}. {t("rights")}
                    </p>
                </div>
            </div>
        </footer>
    );
}
