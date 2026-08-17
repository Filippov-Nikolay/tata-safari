"use client";

import { useRef } from "react";
import { useArrayRefs } from "@/shared/hooks";

export function useGrandDesignGalleryAnimations() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const { setRef: setTileRef } = useArrayRefs<HTMLDivElement>();

    return { sectionRef, gridRef, setTileRef };
}
