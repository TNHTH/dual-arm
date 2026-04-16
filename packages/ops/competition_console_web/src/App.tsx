import { useEffect, useState } from "react";

type Health = {
  status: string;
  profile: string;
  node: string;
};

type RunState = {
  accepted?: boolean;
  status?: string;
  success?: boolean;
  message?: string;
  final_checkpoint_id?: string;
  resume_hint?: string;
};

type Status = {
  profile: string;
  checkpoint_root: string;
  latest_checkpoint_exists: boolean;
  core_running: boolean;
  core_pid?: number | null;
  launch_log: string;
};

type AcceptanceResult = {
  wave: string;
  returncode: number;
  stdout: string;
  stderr: string;
  passes: boolean;
};

const sections = [
  "Dashboard",
  "Bringup",
  "Perception",
  "Planning",
  "Execution",
  "Tasks",
  "Acceptance",
  "Checkpoints",
  "Reviews",
  "Incidents",
];

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [acceptance, setAcceptance] = useState<Record<string, AcceptanceResult>>({});

  useEffect(() => {
    void fetchJson<Health>("/api/health").then(setHealth);
    void fetchJson<Status>("/api/status").then(setStatus);
    void fetchJson<RunState>("/api/tasks/last-run").then(setRunState);
    void fetchJson<Record<string, AcceptanceResult>>("/api/acceptance/results").then((value) => {
      if (value) setAcceptance(value);
    });
  }, []);

  async function postJson<T>(path: string, body?: unknown): Promise<T | null> {
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  async function runCompetition() {
    const result = await postJson<RunState>("/api/tasks/run", { requested_order: "handover,pouring" });
    setRunState(result);
  }

  async function resumeLatest() {
    const result = await postJson<RunState>("/api/tasks/resume-latest");
    setRunState(result);
  }

  async function startBringup() {
    await postJson("/api/bringup/start", {
      start_camera_bridge: true,
      use_mock_camera_stream: true,
      start_detector: false,
      start_hardware: false,
      publish_fake_joint_states: true,
    });
    const latestStatus = await fetchJson<Status>("/api/status");
    setStatus(latestStatus);
  }

  async function stopBringup() {
    await postJson("/api/bringup/stop");
    const latestStatus = await fetchJson<Status>("/api/status");
    setStatus(latestStatus);
  }

  async function runAcceptance(wave: string) {
    const result = await postJson<AcceptanceResult>(`/api/acceptance/run/${wave}`);
    if (!result) return;
    setAcceptance((prev) => ({ ...prev, [wave]: result }));
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>dual-arm</h1>
        <p>competition console</p>
        <nav>
          {sections.map((section) => (
            <button key={section} type="button" className="nav-item">
              {section}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">
        <section className="hero">
          <h2>统一测试与验收入口</h2>
          <p>集成 bringup、验收、断点恢复、证据导出与代码审查可视化。</p>
        </section>
        <section className="panel-grid">
          <article className="panel">
            <h3>System Health</h3>
            <pre>{JSON.stringify({ health, status }, null, 2)}</pre>
          </article>
          <article className="panel">
            <h3>One-click Actions</h3>
            <div className="button-grid">
              <button type="button" onClick={() => void startBringup()}>启动集成栈</button>
              <button type="button" onClick={() => void stopBringup()}>停止集成栈</button>
              <button type="button" onClick={() => void runAcceptance("workspace")}>工作区验收</button>
              <button type="button" onClick={() => void runAcceptance("camera_frames")}>相机 frame 验收</button>
              <button type="button" onClick={() => void runAcceptance("planning_scene")}>PlanningScene smoke</button>
              <button type="button" onClick={() => void runAcceptance("resume")}>接续 smoke</button>
              <button type="button" onClick={() => void runAcceptance("web_console")}>网页验收</button>
              <button type="button">倒水验收</button>
              <button type="button">人机协作验收</button>
              <button type="button" onClick={() => void runCompetition()}>整轮比赛</button>
              <button type="button" onClick={() => void resumeLatest()}>从断点恢复</button>
              <button type="button">导出证据包</button>
            </div>
          </article>
          <article className="panel">
            <h3>Checkpoint</h3>
            <p>此区域显示 latest.json 与历史 run。</p>
          </article>
          <article className="panel">
            <h3>Acceptance / Last Run</h3>
            <pre>{JSON.stringify({ runState, acceptance }, null, 2)}</pre>
          </article>
        </section>
      </main>
    </div>
  );
}
