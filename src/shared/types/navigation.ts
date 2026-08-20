import type { ComponentType, SVGProps } from "react";

export interface NavItem {
    key: string;
    href: string;
    external?: boolean;
    /** Icon shown in contexts that render one (e.g. the mobile bottom nav). */
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
    /** Extra px offset added on top of the default scroll offset for this section. */
    scrollOffset?: number;
    /** Optional stable element used as the scroll anchor instead of the linked section. */
    scrollAnchorId?: string;
    /** Which edge of the scroll anchor should be aligned with the viewport. */
    scrollAlign?: "start" | "end";
}
