import { test, expect } from "@playwright/test";

test("dashboard renders core actions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("统一测试与验收入口")).toBeVisible();
  await expect(page.getByRole("button", { name: "启动集成栈" })).toBeVisible();
  await expect(page.getByRole("button", { name: "从断点恢复" })).toBeVisible();
});
