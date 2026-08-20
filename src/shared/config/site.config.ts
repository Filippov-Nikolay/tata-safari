import { env } from "./env";

// Central place for brand info shown across the site
// (header, preloader, footer, SEO metadata, JSON-LD).
// Works whether you're building a personal portfolio, a product page,
// or a company site — `name` can be a person, a product or a brand.
export const siteConfig = {
    name: "Tata Safari",
    title: "The New Safari",
    description:
        "The New Safari carries on the legendary lineage with contemporary and premium updates.",
    url: env.siteUrl.replace(/\/$/, ""),
    links: {
        github: "https://github.com/Filippov-Nikolay",
        linkedin: "https://www.linkedin.com/in/your-profile",
        telegram: "https://t.me/your-username",
        instagram: "https://instagram.com/your-username",
        email: "mailto:filippovnikolay195@gmail.com",
    },
};
