import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
});

test("supports swiping between gallery slides on touch devices", async ({ page }) => {
    await page.goto("/en");
    await page.waitForSelector("text=Book Now");

    await page.evaluate(() => {
        const el = document.getElementById("grand-design")!;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + 50);
    });

    await page.getByRole("button", { name: "New Parametric Grille" }).click();
    await page.waitForTimeout(1600);

    await expect(page.locator('[role="dialog"] h2')).toHaveText("New Parametric Grille");

    await page.evaluate(() => {
        const overlay = document.querySelector('[role="dialog"]')!;
        const makeTouch = (x: number, y: number) =>
            new Touch({
                identifier: 1,
                target: overlay,
                clientX: x,
                clientY: y,
                pageX: x,
                pageY: y,
            });

        const steps = [
            { x: 200, y: 600 },
            { x: 200, y: 580 },
            { x: 200, y: 540 },
            { x: 200, y: 480 },
        ];

        overlay.dispatchEvent(
            new TouchEvent("touchstart", {
                bubbles: true,
                cancelable: true,
                touches: [makeTouch(steps[0].x, steps[0].y)],
                targetTouches: [makeTouch(steps[0].x, steps[0].y)],
                changedTouches: [makeTouch(steps[0].x, steps[0].y)],
            })
        );

        for (let i = 1; i < steps.length; i++) {
            overlay.dispatchEvent(
                new TouchEvent("touchmove", {
                    bubbles: true,
                    cancelable: true,
                    touches: [makeTouch(steps[i].x, steps[i].y)],
                    targetTouches: [makeTouch(steps[i].x, steps[i].y)],
                    changedTouches: [makeTouch(steps[i].x, steps[i].y)],
                })
            );
        }

        const last = steps[steps.length - 1];
        overlay.dispatchEvent(
            new TouchEvent("touchend", {
                bubbles: true,
                cancelable: true,
                touches: [],
                targetTouches: [],
                changedTouches: [makeTouch(last.x, last.y)],
            })
        );
    });

    await expect(page.locator('[role="dialog"] h2')).toHaveText("Luxurious Comfort");
});
