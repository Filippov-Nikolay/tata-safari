import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/config/site.config";

const BASE = siteConfig.url;
const LAST_MODIFIED = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: `${BASE}/en`,
            lastModified: LAST_MODIFIED,
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: `${BASE}/ru`,
            lastModified: LAST_MODIFIED,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${BASE}/de`,
            lastModified: LAST_MODIFIED,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${BASE}/pl`,
            lastModified: LAST_MODIFIED,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${BASE}/fi`,
            lastModified: LAST_MODIFIED,
            changeFrequency: "monthly",
            priority: 0.9,
        },
    ];
}
