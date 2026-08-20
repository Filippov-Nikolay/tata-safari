"use client";

import { useLayoutEffect } from "react";
import { useLenis } from "@/shared/providers";
import { ScrollTrigger } from "@/shared/lib/gsap";
import { suppressScrollTriggerAutoRefresh } from "./useScrollTriggerAutoRefresh";

interface UseScrollLockOptions {
    preserveScrollPosition?: boolean;
    scrollY?: number;
}

interface ShiftScrollLockOptions {
    syncScrollTriggers?: boolean;
}

let lockCount = 0;
let lockedScrollY = 0;
let domLocked = false;
let pendingUnlock: ReturnType<typeof setTimeout> | null = null;
let restoreBodyPosition = "";
let restoreBodyTop = "";
let restoreBodyLeft = "";
let restoreBodyRight = "";
let restoreBodyWidth = "";
let restoreBodyPaddingRight = "";
let restoreHtmlPaddingRight = "";
let restoreScrollLockOffset = "";

function measureScrollbarWidth() {
    const probe = document.createElement("div");
    probe.style.position = "absolute";
    probe.style.top = "-9999px";
    probe.style.width = "100px";
    probe.style.height = "100px";
    probe.style.overflow = "scroll";
    document.body.appendChild(probe);

    const width = probe.offsetWidth - probe.clientWidth;
    probe.remove();

    return width;
}

function getVisibleScrollY(lenis: ReturnType<typeof useLenis>) {
    const animatedScrollY = lenis?.animatedScroll;

    return Math.round(
        typeof animatedScrollY === "number" && Number.isFinite(animatedScrollY)
            ? animatedScrollY
            : window.scrollY
    );
}

function lockNow(lenis: ReturnType<typeof useLenis>, scrollYOverride?: number) {
    const html = document.documentElement;
    const body = document.body;

    const scrollbarWidth = Math.max(measureScrollbarWidth(), window.innerWidth - html.clientWidth);
    const currentPaddingRight = Number.parseFloat(getComputedStyle(html).paddingRight) || 0;
    const frozenScrollY =
        typeof scrollYOverride === "number"
            ? Math.round(scrollYOverride)
            : getVisibleScrollY(lenis);

    lenis?.scrollTo(frozenScrollY, { immediate: true, force: true });
    lenis?.stop();

    for (const trigger of ScrollTrigger.getAll()) {
        trigger.disable(false);
    }

    lockedScrollY = frozenScrollY;

    const unsuppress = suppressScrollTriggerAutoRefresh();

    restoreBodyPosition = body.style.position;
    restoreBodyTop = body.style.top;
    restoreBodyLeft = body.style.left;
    restoreBodyRight = body.style.right;
    restoreBodyWidth = body.style.width;
    restoreBodyPaddingRight = body.style.paddingRight;
    restoreHtmlPaddingRight = html.style.paddingRight;
    restoreScrollLockOffset = html.style.getPropertyValue("--scroll-lock-offset");

    body.style.position = "fixed";
    body.style.top = `${-frozenScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
        html.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        body.style.paddingRight = `${scrollbarWidth}px`;
    }
    html.style.setProperty("--scroll-lock-offset", `${scrollbarWidth}px`);
    domLocked = true;

    window.setTimeout(unsuppress, 200);
}

function applyDomLock(scrollY: number) {
    const html = document.documentElement;
    const body = document.body;

    const scrollbarWidth = Math.max(measureScrollbarWidth(), window.innerWidth - html.clientWidth);
    const currentPaddingRight = Number.parseFloat(getComputedStyle(html).paddingRight) || 0;

    body.style.position = "fixed";
    body.style.top = `${-scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
        html.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        body.style.paddingRight = `${scrollbarWidth}px`;
    }
    html.style.setProperty("--scroll-lock-offset", `${scrollbarWidth}px`);
    domLocked = true;
}

function restoreDomLockStyles() {
    const html = document.documentElement;
    const body = document.body;

    body.style.position = restoreBodyPosition;
    body.style.top = restoreBodyTop;
    body.style.left = restoreBodyLeft;
    body.style.right = restoreBodyRight;
    body.style.width = restoreBodyWidth;
    body.style.paddingRight = restoreBodyPaddingRight;
    html.style.paddingRight = restoreHtmlPaddingRight;
    if (restoreScrollLockOffset) {
        html.style.setProperty("--scroll-lock-offset", restoreScrollLockOffset);
    } else {
        html.style.removeProperty("--scroll-lock-offset");
    }
}

function syncLockedScrollTriggers(scrollY: number) {
    const unsuppress = suppressScrollTriggerAutoRefresh();

    restoreDomLockStyles();
    domLocked = false;
    void document.body.offsetHeight;

    window.scrollTo(0, scrollY);

    for (const trigger of ScrollTrigger.getAll()) {
        trigger.enable(false, false);
    }
    ScrollTrigger.update();
    for (const trigger of ScrollTrigger.getAll()) {
        trigger.disable(false);
    }

    applyDomLock(scrollY);
    window.setTimeout(unsuppress, 200);
}

function unlockNow(lenis: ReturnType<typeof useLenis>, preserveScrollPosition: boolean) {
    const body = document.body;

    const unsuppress = suppressScrollTriggerAutoRefresh();

    const pinnedScrollY = Math.round(Math.abs(Number.parseFloat(body.style.top) || 0));
    const restoredScrollY = lockedScrollY || pinnedScrollY;
    const targetScrollY = preserveScrollPosition ? restoredScrollY : window.scrollY;

    restoreDomLockStyles();

    domLocked = false;
    void document.body.offsetHeight;

    if (preserveScrollPosition) {
        window.scrollTo(0, targetScrollY);
    }

    lenis?.resize();
    lenis?.scrollTo(targetScrollY, { immediate: true, force: true });
    lenis?.start();
    lenis?.scrollTo(targetScrollY, { immediate: true, force: true });

    for (const trigger of ScrollTrigger.getAll()) {
        trigger.enable(false, false);
    }
    ScrollTrigger.update();

    window.setTimeout(unsuppress, 200);
}

export function isScrollLocked() {
    return domLocked;
}

export function shiftScrollLock(
    deltaY: number,
    { syncScrollTriggers = false }: ShiftScrollLockOptions = {}
) {
    if (!domLocked || Math.abs(deltaY) < 1) {
        return;
    }

    lockedScrollY = Math.max(0, Math.round(lockedScrollY + deltaY));
    document.body.style.top = `${-lockedScrollY}px`;

    if (syncScrollTriggers) {
        syncLockedScrollTriggers(lockedScrollY);
    }
}

export function useScrollLock(
    locked: boolean,
    { preserveScrollPosition = true, scrollY }: UseScrollLockOptions = {}
) {
    const lenis = useLenis();

    useLayoutEffect(() => {
        if (!locked) {
            return;
        }

        if (pendingUnlock !== null) {
            clearTimeout(pendingUnlock);
            pendingUnlock = null;
        } else if (lockCount === 0) {
            lockNow(lenis, scrollY);
        }
        lockCount += 1;

        return () => {
            lockCount = Math.max(0, lockCount - 1);

            if (lockCount === 0) {
                pendingUnlock = setTimeout(() => {
                    pendingUnlock = null;
                    unlockNow(lenis, preserveScrollPosition);
                }, 0);
            }
        };
    }, [locked, lenis, preserveScrollPosition, scrollY]);
}
