import { expect, test } from "@playwright/test";

for (const path of ["/", "/features", "/pricing", "/privacy", "/terms", "/contact"]) {
  test(`public route ${path} renders`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
  });
}

test("protected workspace route does not expose private content without authentication", async ({ page }) => {
  const response = await page.goto("/app");
  expect(response?.status()).toBe(503);
  await expect(page.locator("body")).toContainText("Authentication service is not configured");
});
