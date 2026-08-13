import type { NavItem } from "@/shared/types";

// Single source of truth for the header/footer nav and the scroll-spy
// (active-section highlighting). Add/remove/reorder an entry here and
// every consumer (Header, Footer, useActiveSection) picks it up —
// nothing else needs to change in sync.
//
// Only "overview" (the Hero) exists as a real section today. The rest are
// placeholder links (href="#") until their sections are built — see README
// "Creating a section" for how to wire a new one up.
export const navigation: NavItem[] = [
    { key: "overview", href: "#overview" },
    { key: "edition", href: "#" },
    { key: "specs", href: "#" },
    { key: "compare", href: "#" },
    { key: "reviews", href: "#" },
    { key: "price", href: "#" },
];
