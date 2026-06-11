import { test, expect } from "@playwright/test";

test.describe("Sports Page E2E Checks", () => {
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
          },
          {
            id: "test-match-2",
            league: "IPL",
            leagueLogo: "",
            homeTeam: "Dhaka",
            awayTeam: "Chittagong",
            homeLogo: "",
            awayLogo: "",
            date: "2026-06-11",
            time: "22:00",
            status: "upcoming",
            score: "",
            watchChannel: "T Sports",
            sport: "cricket"
          }
        ],
      });
    });

    // Mock Notifications API
    await page.addInitScript(() => {
      Object.defineProperty(window, "Notification", {
        value: {
          permission: "granted",
          requestPermission: async () => Promise.resolve("granted"),
        },
        writable: true,
      });
    });

    await page.goto("/sports");
  });

  test("should render sports page elements and match cards", async ({ page }) => {
    // Check heading
    const heading = page.locator("h1:has-text('SPORTS')");
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Check live and upcoming sections
    const liveMatch = page.locator("text=Arsenal").first();
    const upcomingMatch = page.locator("text=Dhaka").first();
    await expect(liveMatch).toBeVisible();
    await expect(upcomingMatch).toBeVisible();
  });

  test("should filter fixtures by sport category", async ({ page }) => {
    // Verify default view shows both Arsenal and Dhaka
    await expect(page.locator("text=Arsenal").first()).toBeVisible();
    await expect(page.locator("text=Dhaka").first()).toBeVisible();

    // Click Football tab
    const footballTab = page.locator("button:has-text('Football')");
    await footballTab.click();
    await expect(page.locator("text=Arsenal").first()).toBeVisible();
    await expect(page.locator("text=Dhaka").first()).not.toBeVisible();

    // Click Cricket tab
    const cricketTab = page.locator("button:has-text('Cricket')");
    await cricketTab.click();
    await expect(page.locator("text=Arsenal").first()).not.toBeVisible();
    await expect(page.locator("text=Dhaka").first()).toBeVisible();
  });

  test("should set match reminder successfully", async ({ page }) => {
    // Find reminder button on upcoming match card
    const reminderBtn = page.locator("button:has-text('Set Reminder')").first();
    await expect(reminderBtn).toBeVisible();

    await reminderBtn.click();
    
    // Check toggle status
    const reminderSetBtn = page.locator("button:has-text('Reminder Set')").first();
    await expect(reminderSetBtn).toBeVisible();
  });
});
