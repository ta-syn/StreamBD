import { test, expect } from "@playwright/test";

test.describe("Watch Page E2E Checks", () => {
  test.beforeEach(async ({ page }) => {
    // Mock IPTV API proxy response
    await page.route("**/api/iptv?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain",
        body: `#EXTM3U
#EXTINF:-1 tvg-id="ntv-bd" tvg-name="NTV" tvg-logo="https://iptv-org.github.io/iptv/logos/ntv.png" group-title="Bangladesh",NTV
http://example.com/ntv.m3u8
#EXTINF:-1 tvg-id="tsports" tvg-name="T Sports" tvg-logo="https://iptv-org.github.io/iptv/logos/t-sports.png" group-title="Sports",T Sports
http://example.com/tsports.m3u8`,
      });
    });

    // Mock clipboard API
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async () => Promise.resolve(),
        },
        writable: true,
      });
    });

    await page.goto("/watch/ntv-bd");
  });

  test("should render channel watch page details correctly", async ({ page }) => {
    // Check channel details headers
    const nameHeading = page.locator("h1:has-text('NTV')");
    await expect(nameHeading).toBeVisible({ timeout: 15000 });

    const categoryBadge = page.locator("span:has-text('Bangladesh')").first();
    await expect(categoryBadge).toBeVisible();

    // Check click to play button overlay
    const playBtn = page.locator("text=Click to play");
    await expect(playBtn).toBeVisible();
  });

  test("should copy stream URL to clipboard", async ({ page }) => {
    const copyBtn = page.locator("button:has-text('Copy stream URL')");
    await expect(copyBtn).toBeVisible();

    await copyBtn.click();

    // Verify button text updates
    const copiedText = page.locator("button:has-text('Copied!')");
    await expect(copiedText).toBeVisible();
  });

  test("should click back button and navigate home", async ({ page }) => {
    // Navigate to homepage first to populate history stack
    await page.goto("/");
    await page.goto("/watch/ntv-bd");

    const backBtn = page.locator("button:has-text('Back')");
    await expect(backBtn).toBeVisible();

    await backBtn.click();
    await expect(page).toHaveURL("/");
  });
});
