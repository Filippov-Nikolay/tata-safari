"use client";

import { useEffect } from "react";
import { useLenis } from "@/shared/providers";

let lockCount = 0;
let restoreHtmlOverflow = "";
let restoreBodyOverflow = "";

export function useScrollLock(locked: boolean) {
    const lenis = useLenis();

    useEffect(() => {
        if (!locked) {
            return;
        }

        if (lockCount === 0) {
            const html = document.documentElement;
            restoreHtmlOverflow = html.style.overflow;
            restoreBodyOverflow = document.body.style.overflow;
            html.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        }
        lockCount += 1;
        lenis?.stop();

        return () => {
            lockCount = Math.max(0, lockCount - 1);

            if (lockCount === 0) {
                document.documentElement.style.overflow = restoreHtmlOverflow;
                document.body.style.overflow = restoreBodyOverflow;
                lenis?.start();
            }
        };
    }, [locked, lenis]);
}
