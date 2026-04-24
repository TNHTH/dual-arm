import { test, expect } from "@playwright/test";

test("dashboard renders core actions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("从网页直接起链路、点动机械臂、操作左右夹爪")).toBeVisible();
  await expect(page.getByRole("button", { name: "应用并启动" })).toBeVisible();
  await expect(page.getByRole("button", { name: "左臂 X+" })).toBeVisible();
  await expect(page.getByRole("button", { name: "右夹爪打开" })).toBeVisible();
  await expect(page.getByRole("button", { name: "保存当前位姿" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "动作组", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "保存动作组" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "动作录制" })).toBeVisible();
  await expect(page.getByRole("button", { name: "开始录制" })).toBeVisible();
});

test("action group api is available", async ({ request }) => {
  const response = await request.get("http://127.0.0.1:18081/api/action-groups");
  expect(response.ok()).toBeTruthy();
  const payload = (await response.json()) as { groups?: unknown[] };
  expect(Array.isArray(payload.groups)).toBeTruthy();
});

test("recording api can start mark and stop", async ({ request }) => {
  const start = await request.post("http://127.0.0.1:18081/api/recordings/start", {
    data: { name: "playwright-recording-smoke", sample_interval_ms: 100 },
  });
  expect(start.ok()).toBeTruthy();

  const mark = await request.post("http://127.0.0.1:18081/api/recordings/mark", {
    data: { label: "smoke-mark" },
  });
  expect(mark.ok()).toBeTruthy();

  const stop = await request.post("http://127.0.0.1:18081/api/recordings/stop");
  expect(stop.ok()).toBeTruthy();
  const payload = (await stop.json()) as { recording?: { samples?: unknown[]; events?: unknown[] } };
  expect(Array.isArray(payload.recording?.samples)).toBeTruthy();
  expect(Array.isArray(payload.recording?.events)).toBeTruthy();
});
