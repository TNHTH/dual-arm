import { test, expect, type Page } from "@playwright/test";

async function installMockApi(page: Page) {
  let recordingActive = false;
  const calls: Record<string, number> = {};
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();
    calls[`${method} ${path}`] = (calls[`${method} ${path}`] ?? 0) + 1;
    const json = (payload: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(payload),
      });

    if (path === "/api/health") {
      return json({ status: "ok", profile: "test", node: "mock_console_api" });
    }
    if (path === "/api/status") {
      return json({
        profile: "test",
        checkpoint_root: ".artifacts/checkpoints/competition",
        latest_checkpoint_exists: false,
        core_running: false,
        launch_log: ".artifacts/competition_core.log",
      });
    }
    if (path === "/api/tasks/last-run") {
      return json({ status: "idle" });
    }
    if (path === "/api/acceptance/results") {
      return json({});
    }
    if (path === "/api/control/state") {
      return json({ left_robot: null, right_robot: null, core_running: false, jog_state: {} });
    }
    if (path === "/api/presets") {
      return json({ left_arm: [], right_arm: [] });
    }
    if (path === "/api/action-groups") {
      return json({ groups: [] });
    }
    if (path === "/api/recordings" && method === "GET") {
      return json({ current: { active: recordingActive }, recordings: [] });
    }
    if (path === "/api/recordings/start") {
      recordingActive = true;
      return json({ started: true, recording: { active: true, id: "mock-recording" } });
    }
    if (path === "/api/recordings/mark") {
      return json({ recorded: true, event: { label: "smoke-mark" } });
    }
    if (path === "/api/recordings/stop") {
      recordingActive = false;
      return json({ stopped: true, recording: { samples: [], events: [] }, recordings: [] });
    }
    if (path === "/api/bringup/start") {
      return json({ started: true, status: "mock_started", pid: 1234 });
    }
    if (path === "/api/control/arm/jog/start" || path === "/api/control/arm/jog/stop") {
      return json({ started: path.endsWith("/start"), stopped: path.endsWith("/stop"), success: true });
    }
    return json({ ok: true });
  });
  return calls;
}

test("dashboard renders core actions", async ({ page }) => {
  await installMockApi(page);
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

test("mocked API-backed actions are wired", async ({ page }) => {
  const calls = await installMockApi(page);
  await page.goto("/");
  await page.getByRole("button", { name: "开始录制" }).click();
  expect(calls["POST /api/recordings/start"]).toBe(1);
  await page.getByRole("button", { name: "应用并启动" }).click();
  expect(calls["POST /api/bringup/start"]).toBe(1);
});
