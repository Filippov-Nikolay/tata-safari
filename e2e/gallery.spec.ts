import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
});

async function openGalleryTile(page: import("@playwright/test").Page, title: string) {
    await page.goto("/en");
    await page.waitForSelector("text=Book Now");

    await page.evaluate(() => {
        const el = document.getElementById("grand-design")!;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + 100);
    });

    await page.getByRole("button", { name: title }).click();
    await page.waitForTimeout(1600);
}

test("keeps the active nav link on the current section while the gallery is open", async ({
    page,
}) => {
    await openGalleryTile(page, "New Parametric Grille");

    const highlightsLink = page.locator("header a", { hasText: "Highlights" });
    const overviewLink = page.locator("header a", { hasText: "Overview" });

    await expect(highlightsLink).toHaveClass(/linkActive/);
    await expect(overviewLink).not.toHaveClass(/linkActive/);
});

test("centers the gallery detail's pagination dots on the viewport", async ({ page }) => {
    await openGalleryTile(page, "New Parametric Grille");

    const viewportWidth = page.viewportSize()!.width;
    const dotsBox = await page.locator('[role="dialog"] [class*="dots"]').boundingBox();

    expect(dotsBox).not.toBeNull();
    const center = dotsBox!.x + dotsBox!.width / 2;
    expect(Math.abs(center - viewportWidth / 2)).toBeLessThan(2);
});

test("closing onto a tile reached by keyboard navigation returns scroll to that tile", async ({
    page,
}) => {
    await openGalleryTile(page, "New Parametric Grille");

    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(800);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(800);

    await expect(page.locator('[role="dialog"] h2')).toHaveText("Effortless Everyday Access");

    await page.locator('button[aria-label="Close"]').click();
    await page.waitForTimeout(2200);

    const tile = page.getByRole("button", { name: "Effortless Everyday Access" });
    await expect(tile).toBeInViewport();
});

test("stepping past the last slide closes the gallery cleanly onto it", async ({ page }) => {
    await openGalleryTile(page, "New Parametric Grille");

    for (let i = 0; i < 4; i++) {
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(800);
    }
    await expect(page.locator('[role="dialog"] h2')).toHaveText("Connected Digital Cockpit");

    await page.keyboard.press("ArrowDown");
    await page.waitForSelector('[role="dialog"]:not([data-nextjs-dialog])', {
        state: "detached",
        timeout: 5000,
    });

    const tile = page.getByRole("button", { name: "Connected Digital Cockpit" });
    await expect(tile).toBeInViewport();
});
