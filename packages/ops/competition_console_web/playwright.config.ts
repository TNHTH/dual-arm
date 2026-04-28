import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 18081",
    url: "http://127.0.0.1:18081",
    reuseExistingServer: true,
    timeout: 120000
  },
  use: {
    baseURL: "http://127.0.0.1:18081",
    channel: "chrome"
  }
});
