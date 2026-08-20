"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { navigation } from "@/shared/config/navigation.config";
import { useMotionVariants } from "@/shared/hooks/useMotionVariants";
import { useActiveSection } from "@/shared/hooks";
import { slideDown } from "@/shared/lib/motion/slide-down";
import { scrollToElementId, scrollToTop } from "@/shared/lib/scroll";
import { useLenis, usePreloader } from "@/shared/providers";
import { cn } from "@/shared/lib/cn";
import styles from "./Header.module.scss";
import { TataLogoIcon, LangSwitcher } from "@/shared/ui";
import type { NavItem } from "@/shared/types";

// Derived from `navigation` — never hardcoded separately, so adding or
// removing a nav entry can't leave the scroll-spy out of sync.
const SECTION_IDS = navigation.map((item) => item.key);

const SCROLL_OFFSET = 100;
const SCROLLED_THRESHOLD_PX = 8;

export function Header() {
    const safeSlideDown = useMotionVariants(slideDown);
    const t = useTranslations("nav");
    const { isReady } = usePreloader();
    const lenis = useLenis();
    // useActiveSection reports "" while at the very top of the page (it
    // assumes a hero *before* the first tracked section). Here "overview"
    // *is* the hero, so top-of-page should still highlight it.
    const activeSection = useActiveSection(SECTION_IDS, isReady) || SECTION_IDS[0];
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > SCROLLED_THRESHOLD_PX);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Full-screen takeover — lock the page behind it so it doesn't
    // scroll along with the (still fixed) header while the menu is open.
    useEffect(() => {
        if (!menuOpen) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [menuOpen]);

    function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) {
        e.preventDefault();
        setMenuOpen(false);
        scrollToElementId(item.scrollAnchorId ?? item.key, {
            align: item.scrollAlign,
            offset: SCROLL_OFFSET + (item.scrollOffset ?? 0),
            lenis,
        });
    }

    return (
        <m.header
            className={cn(styles.wrapper, scrolled && styles.wrapperScrolled)}
            variants={safeSlideDown}
            initial="hidden"
            animate={isReady ? "visible" : "hidden"}
        >
            <svg aria-hidden="true" focusable="false" className={styles.filterDefs}>
                <filter id="navbar-liquid-glass" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.008 0.045"
                        numOctaves={2}
                        seed={4}
                        result="noise"
                    />
                    <feGaussianBlur in="noise" stdDeviation={3} result="softNoise" />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="softNoise"
                        scale={14}
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>

            <div className={styles.main}>
                <Link
                    href="/"
                    className={styles.logo}
                    aria-label="Home"
                    onClick={(e) => {
                        e.preventDefault();
                        setMenuOpen(false);
                        scrollToTop({ lenis });
                    }}
                >
                    <TataLogoIcon className={styles.logoIcon} />
                </Link>

                <div className={styles.actions}>
                    <nav aria-label="Main navigation">
                        <ul className={styles.nav}>
                            {navigation.map((item) => (
                                <li key={item.href + item.key}>
                                    <a
                                        href={item.href}
                                        onClick={(e) => scrollToSection(e, item)}
                                        className={cn(
                                            styles.link,
                                            activeSection === item.key && styles.linkActive
                                        )}
                                    >
                                        <AnimatePresence>
                                            {activeSection === item.key && (
                                                <m.span
                                                    key="pill"
                                                    layoutId="desktop-nav-underline"
                                                    className={styles.activeUnderline}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{
                                                        opacity: {
                                                            duration: 0.2,
                                                            ease: "easeInOut",
                                                        },
                                                        layout: {
                                                            type: "spring",
                                                            stiffness: 380,
                                                            damping: 32,
                                                        },
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>
                                        {t(item.key)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <LangSwitcher className={styles.langSwitcher} />

                    <button
                        type="button"
                        className={cn(styles.menuToggle, menuOpen && styles.menuToggleOpen)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <m.div
                        className={styles.mobileMenu}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <nav aria-label="Mobile navigation">
                            <ul className={styles.mobileNavList}>
                                {navigation.map((item, i) => (
                                    <m.li
                                        key={item.href + item.key}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{
                                            duration: 0.4,
                                            ease: [0.16, 1, 0.3, 1],
                                            delay: 0.1 + i * 0.055,
                                        }}
                                    >
                                        <a
                                            href={item.href}
                                            onClick={(e) => scrollToSection(e, item)}
                                            className={cn(
                                                styles.mobileLink,
                                                activeSection === item.key &&
                                                    styles.mobileLinkActive
                                            )}
                                        >
                                            {t(item.key)}
                                        </a>
                                    </m.li>
                                ))}
                            </ul>
                        </nav>
                    </m.div>
                )}
            </AnimatePresence>
        </m.header>
    );
}
