import type {
    ShowcaseItem,
    ShowcaseItemRaw,
    ShowcaseCarouselData,
    ShowcaseCarouselI18n,
    GalleryData,
    GalleryI18n,
} from "@/shared/types";
import rawGallery from "@/shared/content/gallery.json";
import rawShowcase from "@/shared/content/showcase.json";

const FALLBACK_LOCALE = "en";

function resolveItems(items: ShowcaseItemRaw[], locale: string): ShowcaseItem[] {
    return items.map(({ i18n, ...rest }) => {
        const translation = i18n[locale] ?? i18n[FALLBACK_LOCALE];
        return { ...rest, ...translation };
    });
}

function featuredIdx(data: ShowcaseItem[]): number {
    return Math.max(0, data.findIndex((item) => item.featured));
}

// --- Gallery section: one featured item + a small browsable collection ---

export interface ResolvedGallery {
    data: ShowcaseItem[];
    featuredIndex: number;
    sectionI18n: GalleryI18n;
    collectionUrl: string;
}

export function resolveGallery(locale: string): ResolvedGallery {
    const source = rawGallery as unknown as GalleryData;
    const data = resolveItems(source.items, locale);
    return {
        data,
        featuredIndex: featuredIdx(data),
        sectionI18n: source.i18n[locale] ?? source.i18n[FALLBACK_LOCALE],
        collectionUrl: source.collectionUrl,
    };
}

// --- Primary showcase carousel (rendered right under the hero) ---

export interface ResolvedShowcase {
    data: ShowcaseItem[];
    featuredIndex: number;
    sectionI18n: ShowcaseCarouselI18n;
}

export function resolveShowcase(locale: string): ResolvedShowcase {
    const source = rawShowcase as unknown as ShowcaseCarouselData;
    const data = resolveItems(source.items, locale);
    return {
        data,
        featuredIndex: featuredIdx(data),
        sectionI18n: source.i18n[locale] ?? source.i18n[FALLBACK_LOCALE],
    };
}
