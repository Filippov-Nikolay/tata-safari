import type Lenis from "lenis";

const COMPLETE_EPSILON_PX = 2;
const RETARGET_EPSILON_PX = 12;
const STALL_FRAME_LIMIT = 5;
const DEFAULT_MAX_DURATION_MS = 1400;
const LENIS_NAVIGATION_DURATION = 1.2;
const lenisNavigationEase = (progress: number) => (1 - Math.cos(Math.PI * progress)) / 2;

let activeScrollToken = 0;

interface ManagedScrollOptions {
    behavior?: ScrollBehavior;
    maxDurationMs?: number;
    lenis?: Lenis | null;
}

interface ScrollToElementOptions extends ManagedScrollOptions {
    offset?: number;
    align?: "start" | "end";
}

function runManagedScroll(
    resolveTargetTop: () => number | null,
    {
        behavior = "smooth",
        maxDurationMs = DEFAULT_MAX_DURATION_MS,
        lenis,
    }: ManagedScrollOptions = {},
) {
    const initialTarget = resolveTargetTop();
    if (initialTarget == null) return;

    const token = ++activeScrollToken;

    if (lenis) {
        lenis.scrollTo(initialTarget, {
            duration: LENIS_NAVIGATION_DURATION,
            easing: lenisNavigationEase,
        });
        return;
    }

    let rafId = 0;
    let lastY = window.scrollY;
    let stallFrames = 0;
    let lastIssuedTarget = initialTarget;

    const cleanup = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("wheel", cancelScroll);
        window.removeEventListener("touchstart", cancelScroll);
        window.removeEventListener("pointerdown", cancelScroll);
        window.removeEventListener("keydown", cancelScroll);
    };

    const cancelScroll = () => {
        if (token !== activeScrollToken) return;
        activeScrollToken += 1;
        cleanup();
    };

    const issueScroll = (nextBehavior: ScrollBehavior) => {
        const nextTarget = resolveTargetTop();
        if (nextTarget == null) {
            cleanup();
            return null;
        }

        lastIssuedTarget = nextTarget;
        window.scrollTo({ top: nextTarget, behavior: nextBehavior });
        return nextTarget;
    };

    window.addEventListener("wheel", cancelScroll, { passive: true });
    window.addEventListener("touchstart", cancelScroll, { passive: true });
    window.addEventListener("pointerdown", cancelScroll, { passive: true });
    window.addEventListener("keydown", cancelScroll);

    issueScroll(behavior);
    const startedAt = performance.now();

    const tick = () => {
        if (token !== activeScrollToken) return;

        const targetTop = resolveTargetTop();
        if (targetTop == null) {
            cleanup();
            return;
        }

        const currentY = window.scrollY;
        const distance = targetTop - currentY;

        if (Math.abs(distance) <= COMPLETE_EPSILON_PX) {
            cleanup();
            return;
        }

        stallFrames = Math.abs(currentY - lastY) < 0.5 ? stallFrames + 1 : 0;

        const targetShifted = Math.abs(targetTop - lastIssuedTarget) > RETARGET_EPSILON_PX;
        if (targetShifted || stallFrames >= STALL_FRAME_LIMIT) {
            issueScroll("smooth");
            stallFrames = 0;
        }

        lastY = currentY;

        if (performance.now() - startedAt >= maxDurationMs) {
            if (Math.abs(targetTop - window.scrollY) > COMPLETE_EPSILON_PX) {
                issueScroll("auto");
            }
            cleanup();
            return;
        }

        rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
}

export function scrollToElementId(
    id: string,
    { offset = 0, align = "start", ...options }: ScrollToElementOptions = {},
) {
    runManagedScroll(() => {
        const el = document.getElementById(id);
        if (!el) return null;

        const rect = el.getBoundingClientRect();
        const alignmentOffset = align === "end" ? window.innerHeight - rect.height : 0;

        return Math.max(0, rect.top + window.scrollY - alignmentOffset - offset);
    }, options);
}

export function scrollToTop(options?: ManagedScrollOptions) {
    runManagedScroll(() => 0, options);
}
