import type { Metadata, Viewport } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import { cookies, headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { siteConfig } from "@/shared/config/site.config";
import { AppProviders } from "@/shared/providers";
import { Header } from "@/widgets/Header";
import { routing, type Locale } from "@/i18n/routing";

import "@/shared/styles/globals.scss";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#141218",
};

const sora = Sora({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-sora",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

const HREFLANG_LANGUAGES = {
    en: `${siteConfig.url}/en`,
    ru: `${siteConfig.url}/ru`,
    de: `${siteConfig.url}/de`,
    pl: `${siteConfig.url}/pl`,
    fi: `${siteConfig.url}/fi`,
    "x-default": `${siteConfig.url}/en`,
};

// Per-locale SEO copy. Brand parts (name, title) are pulled from siteConfig
// so you only edit the description text below when localizing.
const LOCALE_META: Record<string, { title: string; description: string; ogLocale: string }> = {
    en: {
        title: `${siteConfig.name} — ${siteConfig.title}`,
        description: `${siteConfig.description} Built with React, Next.js and TypeScript — SSR, performance and SEO ready out of the box.`,
        ogLocale: "en_US",
    },
    ru: {
        title: `${siteConfig.name} — ${siteConfig.title}`,
        description: `${siteConfig.description} Построено на React, Next.js и TypeScript — SSR, производительность и SEO из коробки.`,
        ogLocale: "ru_RU",
    },
    de: {
        title: `${siteConfig.name} — ${siteConfig.title}`,
        description: `${siteConfig.description} Entwickelt mit React, Next.js und TypeScript — SSR, Performance und SEO von Anfang an.`,
        ogLocale: "de_DE",
    },
    pl: {
        title: `${siteConfig.name} — ${siteConfig.title}`,
        description: `${siteConfig.description} Zbudowane w React, Next.js i TypeScript — SSR, wydajność i SEO od podstaw.`,
        ogLocale: "pl_PL",
    },
    fi: {
        title: `${siteConfig.name} — ${siteConfig.title}`,
        description: `${siteConfig.description} Rakennettu Reactilla, Next.js:llä ja TypeScriptillä — SSR, suorituskyky ja SEO alusta asti.`,
        ogLocale: "fi_FI",
    },
};

const KEYWORDS_COMMON = [siteConfig.name, siteConfig.title, "React", "Next.js", "TypeScript"];

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
    const { locale } = await params;
    const meta = LOCALE_META[locale] ?? LOCALE_META.en;

    return {
        metadataBase: new URL(siteConfig.url),
        title: {
            default: meta.title,
            template: `%s | ${siteConfig.name}`,
        },
        description: meta.description,
        keywords: KEYWORDS_COMMON,
        authors: [{ name: siteConfig.name }],
        creator: siteConfig.name,
        alternates: {
            canonical: `${siteConfig.url}/${locale}`,
            languages: HREFLANG_LANGUAGES,
        },
        openGraph: {
            title: meta.title,
            description: meta.description,
            url: `${siteConfig.url}/${locale}`,
            siteName: siteConfig.name,
            type: "website",
            locale: meta.ogLocale,
            images: [{ url: "/og/cover.jpg", width: 1731, height: 909 }],
        },
        twitter: {
            card: "summary_large_image",
            title: meta.title,
            description: meta.description,
            images: ["/og/cover.jpg"],
        },
        icons: {
            icon: [
                { url: "/icon.svg", type: "image/svg+xml" },
                { url: "/favicon.svg", type: "image/svg+xml" },
                { url: "/icon/icon.svg", type: "image/svg+xml" },
                { url: "/icon/icon.png", type: "image/png" },
            ],
            shortcut: "/icon/icon.png",
        },
        robots: { index: true, follow: true },
    };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as Locale)) {
        notFound();
    }

    const [messages, cookieStore, requestHeaders] = await Promise.all([
        getMessages(),
        cookies(),
        headers(),
    ]);

    // Приоритет: кука (явный выбор пользователя)
    //          → Sec-CH-Prefers-Color-Scheme (системная тема, Chrome 2й+ визит)
    //          → "dark" (абсолютный fallback; useTheme на клиенте поправит без flash)
    const savedTheme = cookieStore.get("site-theme")?.value;
    const clientHint = requestHeaders.get("sec-ch-prefers-color-scheme");
    const theme: "dark" | "light" =
        savedTheme === "light" || savedTheme === "dark"
            ? savedTheme
            : clientHint === "light" || clientHint === "dark"
              ? clientHint
              : "dark";

    // Generic "WebSite" structured data — swap the @type for "Person" (personal
    // portfolio), "Organization" (company/agency) or "Product" (SaaS/product)
    // depending on what you're building. See README > Customization > SEO.
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        description: siteConfig.title,
        url: siteConfig.url,
        sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
    };

    return (
        <html
            lang={locale}
            data-theme={theme}
            suppressHydrationWarning
            className={`${sora.variable} ${geistMono.variable}`}
        >
            <body>
                <NextIntlClientProvider messages={messages}>
                    <AppProviders>
                        <Header />
                        {children}
                    </AppProviders>
                    <SpeedInsights />
                    <Analytics />
                </NextIntlClientProvider>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </body>
        </html>
    );
}
