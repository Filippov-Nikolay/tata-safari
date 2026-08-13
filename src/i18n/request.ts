import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

const messageLoaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
    en: () => import("../../messages/en.json"),
    ru: () => import("../../messages/ru.json"),
    de: () => import("../../messages/de.json"),
    pl: () => import("../../messages/pl.json"),
    fi: () => import("../../messages/fi.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = (await requestLocale) as Locale | undefined;

    if (!locale || !routing.locales.includes(locale)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await messageLoaders[locale]()).default,
    };
});
