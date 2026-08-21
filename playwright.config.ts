import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? "list" : "html",
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },
    webServer: {
        // Dev server, not a production build: these tests exercise runtime
        // behavior (scroll lock, animation state, navigation), not build
        // output, and this way CI doesn't need a separate build step first.
        command: "npm run dev",
        url: "http://localhost:3000/en",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
            testIgnore: /\.mobile\.spec\.ts$/,
        },
        {
            name: "mobile-chrome",
            use: { ...devices["Pixel 7"] },
            testMatch: /\.mobile\.spec\.ts$/,
        },
    ],
});
