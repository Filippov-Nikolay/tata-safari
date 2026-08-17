"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { useGrandDesignGalleryAnimations } from "./useGrandDesignGalleryAnimations";
import styles from "./GrandDesignGallery.module.scss";

const TILES = [
    { src: "/grand-design/image-1.png", tile: styles.tile1 },
    { src: "/grand-design/image-2.png", tile: styles.tile2 },
    { src: "/grand-design/image-3.png", tile: styles.tile3 },
    { src: "/grand-design/image-4.png", tile: styles.tile4 },
    { src: "/grand-design/image-5.png", tile: styles.tile5 },
] as const;

export function GrandDesignGallery() {
    const t = useTranslations("hero");
    const { sectionRef, gridRef, setTileRef } = useGrandDesignGalleryAnimations();

    const [loaded, setLoaded] = useState<boolean[]>(() => TILES.map(() => false));

    const markLoaded = (index: number) => {
        setLoaded((prev) => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
        });
    };

    return (
        <Section id="grand-design" className={styles.section}>
            <div ref={sectionRef} className={styles.wrap}>
                <div ref={gridRef} className={styles.grid}>
                    {TILES.map((item, index) => (
                        <div key={item.src} ref={setTileRef(index)} className={cn(styles.tile, item.tile)}>
                            <Image
                                src={item.src}
                                alt={t("detailTitle")}
                                fill
                                sizes="(max-width: 768px) 100vw, 60vw"
                                onLoad={() => markLoaded(index)}
                                className={cn(styles.tileImage, loaded[index] && styles.tileImageLoaded)}
                            />
                            <div className={styles.tileScrim} aria-hidden="true" />
                            <div className={styles.tileCallout}>
                                <h3 className={styles.tileTitle}>{t("detailTitle")}</h3>
                                <p className={styles.tileText}>{t("detailDescription")}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
