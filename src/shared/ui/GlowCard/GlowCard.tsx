"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import styles from "./GlowCard.module.scss";

type GlowColor = "purple" | "orange";

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
    glow?: GlowColor;
}

export function GlowCard({
    glow = "purple",
    className,
    children,
    ...props
}: GlowCardProps) {
    return (
        <div
            className={cn(styles.card, styles[`glow-${glow}`], className)}
            {...props}
        >
            {children}
        </div>
    );
}

GlowCard.displayName = "GlowCard";
