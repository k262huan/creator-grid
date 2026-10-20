import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:3001", headless: true, launchOptions: { executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] } },
  webServer: { command: "npm run start -- -p 3001", url: "http://127.0.0.1:3001", reuseExistingServer: false, timeout: 120_000 },
  reporter: "line",
});
