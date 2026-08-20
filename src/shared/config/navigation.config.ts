import type { NavItem } from "@/shared/types";

// Single source of truth for the header/footer nav and the scroll-spy
// (active-section highlighting). Add/remove/reorder an entry here and
// every consumer (Header, Footer, useActiveSection) picks it up —
// nothing else needs to change in sync.
//
// Only these two sections actually exist on the page today. Add an entry
// here only once its section is really built and rendered — a nav item
// with nothing to scroll to is worse than no nav item.
export const navigation: NavItem[] = [
    { key: "overview", href: "#overview" },
    {
        key: "grand-design",
        href: "#grand-design",
        scrollAnchorId: "overview",
        scrollAlign: "end",
        scrollOffset: 70,
    },
];
