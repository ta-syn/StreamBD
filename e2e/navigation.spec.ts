import { test, expect } from "@playwright/test";

test.describe("Navigation & Layout Checks", () => {
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

    // Mock Sports API proxy response
    await page.route("**/api/sports", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: [
          {
            id: "test-match-1",
            league: "Premier League",
            leagueLogo: "",
            homeTeam: "Arsenal",
            awayTeam: "Chelsea",
            homeLogo: "",
            awayLogo: "",
            date: "2026-06-11",
            time: "20:00",
            status: "live",
            score: "1-0",
            watchChannel: "T Sports",
            sport: "football"
          }
        ],
      });
    });

    await page.goto("/");
    const channelCards = page.locator('[data-testid="channel-card"]');
    await expect(channelCards.first()).toBeVisible({ timeout: 15000 });
  });

  test("should load the homepage and show navigation elements", async ({ page }) => {
    const logoStream = page.locator("nav").locator("text=STREAM");
    const logoBd = page.locator("nav").locator("text=BD");
    await expect(logoStream).toBeVisible({ timeout: 15000 });
    await expect(logoBd).toBeVisible();

    const homeLink = page.locator('nav a:has-text("Home")').first();
    const sportsLink = page.locator('nav a:has-text("Sports")').first();
    await expect(homeLink).toBeVisible();
    await expect(sportsLink).toBeVisible();
  });

  test("should render category tabs", async ({ page }) => {
    const bdTab = page.locator('[data-category="bangladesh"]');
    await expect(bdTab).toBeVisible({ timeout: 15000 });

    const sportsTab = page.locator('[data-category="sports"]');
    await expect(sportsTab).toBeVisible();

    await sportsTab.click();
  });
});
