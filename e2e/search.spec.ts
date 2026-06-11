import { test, expect } from "@playwright/test";

test.describe("Search Modal E2E Checks", () => {
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

  test("should open and close search modal", async ({ page }) => {
    const searchBtn = page.locator('[data-testid="search-nav-btn"]');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });

    // Click search button
    await searchBtn.click();

    // Check modal is visible
    const searchModal = page.locator('[data-testid="search-modal"]');
    await expect(searchModal).toBeVisible();

    // Press Escape to close modal
    await page.keyboard.press("Escape");
    await expect(searchModal).not.toBeVisible();
  });

  test("should input search query and view filtering", async ({ page }) => {
    const searchBtn = page.locator('[data-testid="search-nav-btn"]');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    // Find input by placeholder
    const searchInput = page.getByPlaceholder("Search channels...");
    await expect(searchInput).toBeFocused();

    // Type query
    await searchInput.fill("nonexistentchannelname");
    
    // Wait for debounce and verify no channels message
    const noResults = page.locator("text=No channels found");
    await expect(noResults).toBeVisible();
  });
});
