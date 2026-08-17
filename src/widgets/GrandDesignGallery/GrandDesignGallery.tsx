"use client";

import { useState } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Section } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { useGrandDesignGalleryAnimations } from "./useGrandDesignGalleryAnimations";
import { GalleryDetail } from "./GalleryDetail";
import styles from "./GrandDesignGallery.module.scss";

const TILES = [
    { key: "tile1", src: "/grand-design/image-1.png", tile: styles.tile1 },
    { key: "tile2", src: "/grand-design/image-2.png", tile: styles.tile2 },
    { key: "tile3", src: "/grand-design/image-3.png", tile: styles.tile3 },
    { key: "tile4", src: "/grand-design/image-4.png", tile: styles.tile4 },
    { key: "tile5", src: "/grand-design/image-5.png", tile: styles.tile5 },
] as const;

export function GrandDesignGallery() {
    const t = useTranslations("gallery");
    const { sectionRef, gridRef, setTileRef } = useGrandDesignGalleryAnimations();

    const [loaded, setLoaded] = useState<boolean[]>(() => TILES.map(() => false));
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [activeRatio, setActiveRatio] = useState(16 / 9);

    const markLoaded = (index: number) => {
        setLoaded((prev) => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
        });
    };

    const activeTile = TILES.find((item) => item.key === activeKey) ?? null;

    return (
        <Section id="grand-design" className={styles.section}>
            <div ref={sectionRef} className={styles.wrap}>
                <div ref={gridRef} className={styles.grid}>
                    {TILES.map((item, index) => (
                        <button
                            key={item.key}
                            type="button"
                            ref={setTileRef(index)}
                            className={cn(styles.tile, item.tile)}
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setActiveRatio(rect.width / rect.height);
                                setActiveKey(item.key);
                            }}
                        >
                            <m.div className={styles.tileImageWrap} layoutId={`gallery-image-${item.key}`}>
                                <Image
                                    src={item.src}
                                    alt={t(`${item.key}.title`)}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                    onLoad={() => markLoaded(index)}
                                    className={cn(styles.tileImage, loaded[index] && styles.tileImageLoaded)}
                                />
                            </m.div>
                            <div className={styles.tileScrim} aria-hidden="true" />
                            <div className={styles.tileCallout}>
                                <h3 className={styles.tileTitle}>{t(`${item.key}.title`)}</h3>
                                <p className={styles.tileText}>{t(`${item.key}.short`)}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <GalleryDetail
                item={
                    activeTile && {
                        key: activeTile.key,
                        src: activeTile.src,
                        title: t(`${activeTile.key}.title`),
                        text: t(`${activeTile.key}.expanded`),
                    }
                }
                onClose={() => setActiveKey(null)}
                closeLabel={t("close")}
                imageRatio={activeRatio}
            />
        </Section>
    );
}
