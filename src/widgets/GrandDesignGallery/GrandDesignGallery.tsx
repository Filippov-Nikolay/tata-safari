"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { ScrollTrigger } from "@/shared/lib/gsap";
import { useLenis } from "@/shared/providers";
import { useGrandDesignGalleryAnimations } from "./useGrandDesignGalleryAnimations";
import { GalleryDetail, type TileVisualSnapshot } from "./GalleryDetail";
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
    const lenis = useLenis();
    const { sectionRef, gridRef, setTileRef, tileRefs } = useGrandDesignGalleryAnimations();

    const [loaded, setLoaded] = useState<boolean[]>(() => TILES.map(() => false));
    const [startIndex, setStartIndex] = useState<number | null>(null);
    const [activeTileKey, setActiveTileKey] = useState<string | null>(null);
    const [launchSnapshot, setLaunchSnapshot] = useState<TileVisualSnapshot | null>(null);
    const [sessionId, setSessionId] = useState(0);

    const markLoaded = (index: number) => {
        setLoaded((prev) => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
        });
    };

    const getSnapshotForKey = useCallback((key: string, scrollY = window.scrollY): TileVisualSnapshot | null => {
        const index = TILES.findIndex((tile) => tile.key === key);
        if (index === -1) return null;

        const tile = tileRefs.current[index];
        if (!tile) return null;

        const imageWrap = tile.querySelector<HTMLElement>(`.${styles.tileImageWrap}`);
        const image = tile.querySelector<HTMLImageElement>("img");
        const rect = (imageWrap ?? tile).getBoundingClientRect();
        const computedImageStyle = image ? window.getComputedStyle(image) : null;

        return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            imageTransform: computedImageStyle?.transform && computedImageStyle.transform !== "none"
                ? computedImageStyle.transform
                : "none",
            imageTransformOrigin: computedImageStyle?.transformOrigin ?? "50% 50%",
            scrollY,
        };
    }, [tileRefs]);

    const items = TILES.map((tile) => ({
        key: tile.key,
        src: tile.src,
        title: t(`${tile.key}.title`),
        text: t(`${tile.key}.expanded`),
    }));

    return (
        <Section id="grand-design" className={styles.section}>
            <div ref={sectionRef} className={styles.wrap}>
                <div ref={gridRef} className={styles.grid}>
                    {TILES.map((item, index) => (
                        <button
                            key={item.key}
                            type="button"
                            ref={setTileRef(index)}
                            className={cn(
                                styles.tile,
                                item.tile,
                                activeTileKey === item.key && styles.tileActive,
                            )}
                            onClick={() => {
                                const visualScrollY = lenis?.animatedScroll ?? window.scrollY;
                                lenis?.scrollTo(visualScrollY, { immediate: true, force: true });
                                ScrollTrigger.update();

                                setSessionId((id) => id + 1);
                                setLaunchSnapshot(getSnapshotForKey(item.key, visualScrollY));
                                setActiveTileKey(item.key);
                                setStartIndex(index);
                            }}
                        >
                            <div className={styles.tileImageWrap}>
                                <div className={styles.tileDepthLayer}>
                                    <Image
                                        src={item.src}
                                        alt={t(`${item.key}.title`)}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 60vw"
                                        onLoad={() => markLoaded(index)}
                                        className={cn(styles.tileImage, loaded[index] && styles.tileImageLoaded)}
                                    />
                                </div>
                            </div>
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
                key={`detail-${sessionId}`}
                items={items}
                startIndex={startIndex}
                launchSnapshot={launchSnapshot}
                getSnapshotForKey={getSnapshotForKey}
                onClose={() => {
                    setStartIndex(null);
                    setLaunchSnapshot(null);
                }}
                onActiveKeyChange={setActiveTileKey}
                onReturnReady={() => setActiveTileKey(null)}
                onExitComplete={() => setActiveTileKey(null)}
                closeLabel={t("close")}
            />
        </Section>
    );
}
