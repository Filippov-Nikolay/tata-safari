import { test, expect } from "@playwright/test";

test("keeps the page scrollable after switching locale", async ({ page }) => {
    await page.goto("/en");
    await page.waitForSelector("text=Book Now");
    await page.waitForTimeout(1000);

    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(1200);
    const scrollYBeforeSwitch = await page.evaluate(() => window.scrollY);
    expect(scrollYBeforeSwitch).toBeGreaterThan(0);

    await page.locator('button[aria-label^="Language:"]').click();
    await page.locator('li[role="option"] button', { hasText: "RU" }).click();
    await page.waitForURL("**/ru");
    await page.waitForSelector("text=Забронировать");
    await page.waitForTimeout(1000);

    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(1200);
    const scrollYAfterSwitch = await page.evaluate(() => window.scrollY);

    expect(scrollYAfterSwitch).toBeGreaterThan(0);
});
