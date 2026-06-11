import { test, expect } from "@playwright/test";

test.describe("Favorites System E2E Checks", () => {
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
  });

  test("should add and remove a favorite channel", async ({ page }) => {
    // Wait for channel cards to load (with higher timeout for Next.js compilation)
    const channelCards = page.locator('[data-testid="channel-card"]');
    await expect(channelCards.first()).toBeVisible({ timeout: 20000 });

    // Click the favorite heart button directly (using force: true to bypass hover overlay checks)
    const favoriteBtn = channelCards.first().locator('[data-testid="favorite-btn"]');
    await favoriteBtn.click({ force: true });

    // Open favorites drawer
    const favoritesNavBtn = page.locator('[data-testid="favorites-nav-btn"]');
    await expect(favoritesNavBtn).toBeVisible();
    await favoritesNavBtn.click();

    // Wait for the drawer slide-in animation to complete
    await page.waitForTimeout(500);

    // Verify channel is in favorites panel
    const favoritesPanel = page.locator('[data-testid="favorites-panel"]');
    await expect(favoritesPanel).toBeVisible();
    
    // Check if Play button is visible inside panel, confirming a card exists
    const playBtn = favoritesPanel.locator("text=Play");
    await expect(playBtn).toBeVisible();

    // Remove the favorite via panel
    const removeBtn = favoritesPanel.locator('[data-testid="remove-favorite-btn"]').first();
    await removeBtn.click({ force: true });

    // Confirm favorites empty state
    const emptyMsg = favoritesPanel.locator("text=No favorites yet");
    await expect(emptyMsg).toBeVisible();
  });
});
