import { startTransition, useEffect, useRef, useState } from "react";
import { deleteJson, fetchJson, postJson } from "./apiClient";

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

type BringupConfig = {
  start_hardware: boolean;
  start_detector: boolean;
  start_camera_bridge: boolean;
  use_mock_camera_stream: boolean;
  publish_fake_joint_states: boolean;
  profile?: string;
  left_robot_ip: string;
  right_robot_ip: string;
  camera_color_device: string;
  camera_depth_device: string;
  camera_depth_backend: string;
};

type Status = {
  profile: string;
  checkpoint_root: string;
  latest_checkpoint_exists: boolean;
  core_running: boolean;
  core_pid?: number | null;
  launch_log: string;
  last_bringup_request?: BringupConfig;
};

type AcceptanceResult = {
  wave: string;
  returncode: number;
  stdout: string;
  stderr: string;
  passes: boolean;
};

type RobotStateView = {
  motion_done: boolean;
  error_code: number;
  joint_position: Record<string, number>;
  tcp_pose: Record<string, number>;
  stamp: {
    sec: number;
    nanosec: number;
  };
};

type JogSessionState = {
  active: boolean;
  axis: string | null;
  delta_mm: number;
  velocity: number;
  acceleration: number;
  interval_ms: number;
  session_id: string | null;
  started_at: string | null;
  stopped_at: string | null;
  stop_reason: string | null;
  last_result: unknown;
};

type ControlState = {
  left_robot: RobotStateView | null;
  right_robot: RobotStateView | null;
  core_running: boolean;
  jog_state?: Record<"left_arm" | "right_arm", JogSessionState>;
};

type GripperSnapshot = {
  success: boolean;
  position?: number;
  speed?: number;
  force?: number;
  interpreted_state?: string;
  object_status?: string;
  captured_at?: string;
  message?: string;
};

type PosePreset = {
  id: string;
  name: string;
  created_at: string;
  joint_positions: number[];
  tcp_pose: Record<string, number>;
  gripper_state?: GripperSnapshot | null;
};

type PosePresetMap = {
  left_arm: PosePreset[];
  right_arm: PosePreset[];
};

type ActionGroupStep = {
  arm: "left_arm" | "right_arm";
  preset_id: string;
  include_gripper: boolean;
  delay_ms: number;
  stop_on_failure: boolean;
};

type ActionGroup = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  steps: ActionGroupStep[];
};

type ActionGroupEnvelope = {
  groups: ActionGroup[];
};

type RecordingSummary = {
  id: string;
  name: string;
  started_at?: string;
  stopped_at?: string | null;
  duration_ms?: number;
  sample_count: number;
  event_count: number;
  path?: string;
};

type CurrentRecording = {
  active: boolean;
  id?: string;
  name?: string;
  started_at?: string;
  sample_interval_ms?: number;
  sample_count?: number;
  event_count?: number;
};

type RecordingEnvelope = {
  current: CurrentRecording;
  recordings: RecordingSummary[];
};

type RecordingDetail = RecordingSummary & {
  samples: unknown[];
  events: unknown[];
};

type ActionFeedback = {
  title: string;
  ok: boolean;
  payload: unknown;
};

const sections = ["Overview", "Bringup", "Robots", "Grippers", "Acceptance", "Runtime"];

const defaultBringup: BringupConfig = {
  start_hardware: false,
  start_detector: false,
  start_camera_bridge: false,
  use_mock_camera_stream: false,
  publish_fake_joint_states: false,
  left_robot_ip: "192.168.58.2",
  right_robot_ip: "192.168.58.3",
  camera_color_device: "auto",
  camera_depth_device: "auto",
  camera_depth_backend: "auto",
};

const jogAxes = [
  { key: "x", label: "X" },
  { key: "y", label: "Y" },
  { key: "z", label: "Z" },
  { key: "rx", label: "RX" },
  { key: "ry", label: "RY" },
  { key: "rz", label: "RZ" },
] as const;

function isActionSuccess(payload: unknown): boolean {
  if (payload === null || payload === undefined) {
    return false;
  }
  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.success === "boolean") {
      return record.success;
    }
    if (typeof record.passes === "boolean") {
      return record.passes;
    }
    if (typeof record.error === "string") {
      return false;
    }
  }
  return true;
}

function formatPoseValue(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return "--";
  }
  return value.toFixed(2);
}

function describeGripperSnapshot(snapshot: GripperSnapshot | null | undefined): string {
  if (!snapshot) {
    return "夹爪: 未记录";
  }
  if (!snapshot.success) {
    return `夹爪: 读取失败${snapshot.message ? ` (${snapshot.message})` : ""}`;
  }
  const state = snapshot.interpreted_state ?? "unknown";
  const position = snapshot.position ?? -1;
  return `夹爪: ${state} / pos=${position}`;
}

function RobotSummary({ title, state }: { title: string; state: RobotStateView | null }) {
  const pose = state?.tcp_pose ?? {};
  const joints = state?.joint_position ?? {};
  return (
    <article className="robot-card">
      <header>
        <h4>{title}</h4>
        <span className={`status-pill ${state?.error_code === 0 ? "ok" : "warn"}`}>
          {state ? (state.motion_done ? "idle" : "moving") : "offline"}
        </span>
      </header>
      <dl className="robot-metrics">
        <div>
          <dt>X</dt>
          <dd>{formatPoseValue(pose.x)}</dd>
        </div>
        <div>
          <dt>Y</dt>
          <dd>{formatPoseValue(pose.y)}</dd>
        </div>
        <div>
          <dt>Z</dt>
          <dd>{formatPoseValue(pose.z)}</dd>
        </div>
        <div>
          <dt>RX</dt>
          <dd>{formatPoseValue(pose.rx)}</dd>
        </div>
        <div>
          <dt>RY</dt>
          <dd>{formatPoseValue(pose.ry)}</dd>
        </div>
        <div>
          <dt>RZ</dt>
          <dd>{formatPoseValue(pose.rz)}</dd>
        </div>
      </dl>
      <dl className="joint-metrics">
        {["j1", "j2", "j3", "j4", "j5", "j6"].map((joint) => (
          <div key={`${title}-${joint}`}>
            <dt>{joint.toUpperCase()}</dt>
            <dd>{formatPoseValue(joints[joint])}</dd>
          </div>
        ))}
      </dl>
      <p className="robot-meta">error={state?.error_code ?? "--"}</p>
    </article>
  );
}

export function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [acceptance, setAcceptance] = useState<Record<string, AcceptanceResult>>({});
  const [controlState, setControlState] = useState<ControlState | null>(null);
  const [presets, setPresets] = useState<PosePresetMap>({ left_arm: [], right_arm: [] });
  const [actionGroups, setActionGroups] = useState<ActionGroup[]>([]);
  const [currentRecording, setCurrentRecording] = useState<CurrentRecording>({ active: false });
  const [recordings, setRecordings] = useState<RecordingSummary[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<RecordingDetail | null>(null);
  const [bringupForm, setBringupForm] = useState<BringupConfig>(defaultBringup);
  const [bringupInitialized, setBringupInitialized] = useState(false);
  const [jogDelta, setJogDelta] = useState(5);
  const [jogVelocity, setJogVelocity] = useState(5);
  const [gripperPosition, setGripperPosition] = useState(200);
  const [gripperSpeed, setGripperSpeed] = useState(255);
  const [gripperTorque, setGripperTorque] = useState(255);
  const [presetVelocity, setPresetVelocity] = useState(5);
  const [presetAcceleration, setPresetAcceleration] = useState(5);
  const [presetNames, setPresetNames] = useState<Record<"left_arm" | "right_arm", string>>({
    left_arm: "",
    right_arm: "",
  });
  const [actionGroupName, setActionGroupName] = useState("");
  const [draftActionGroupSteps, setDraftActionGroupSteps] = useState<ActionGroupStep[]>([]);
  const [recordingName, setRecordingName] = useState("");
  const [recordingMark, setRecordingMark] = useState("");
  const [recordingInterval, setRecordingInterval] = useState(200);
  const [activeJogKey, setActiveJogKey] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<ActionFeedback | null>(null);
  const activeJogArmRef = useRef<"left_arm" | "right_arm" | null>(null);
  const activeJogKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function syncDashboard() {
      const [healthNext, statusNext, runNext, acceptanceNext, controlNext, presetsNext, actionGroupsNext, recordingsNext] = await Promise.all([
        fetchJson<Health>("/api/health"),
        fetchJson<Status>("/api/status"),
        fetchJson<RunState>("/api/tasks/last-run"),
        fetchJson<Record<string, AcceptanceResult>>("/api/acceptance/results"),
        fetchJson<ControlState>("/api/control/state"),
        fetchJson<PosePresetMap>("/api/presets"),
        fetchJson<ActionGroupEnvelope>("/api/action-groups"),
        fetchJson<RecordingEnvelope>("/api/recordings"),
      ]);

      if (cancelled) {
        return;
      }

      startTransition(() => {
        setHealth(healthNext);
        setStatus(statusNext);
        setRunState(runNext);
        setAcceptance(acceptanceNext ?? {});
        setControlState(controlNext);
        setPresets(presetsNext ?? { left_arm: [], right_arm: [] });
        setActionGroups(actionGroupsNext?.groups ?? []);
        setCurrentRecording(recordingsNext?.current ?? { active: false });
        setRecordings(recordingsNext?.recordings ?? []);
      });
    }

    void syncDashboard();
    const timer = window.setInterval(() => {
      void syncDashboard();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (bringupInitialized || !status?.last_bringup_request) {
      return;
    }
    setBringupForm({ ...defaultBringup, ...status.last_bringup_request });
    setBringupInitialized(true);
  }, [bringupInitialized, status]);

  function updateBringupField<K extends keyof BringupConfig>(key: K, value: BringupConfig[K]) {
    setBringupForm((current) => ({ ...current, [key]: value }));
  }

  async function refreshStatus() {
    const [statusNext, controlNext, runNext, presetsNext, actionGroupsNext, recordingsNext] = await Promise.all([
      fetchJson<Status>("/api/status"),
      fetchJson<ControlState>("/api/control/state"),
      fetchJson<RunState>("/api/tasks/last-run"),
      fetchJson<PosePresetMap>("/api/presets"),
      fetchJson<ActionGroupEnvelope>("/api/action-groups"),
      fetchJson<RecordingEnvelope>("/api/recordings"),
    ]);
    startTransition(() => {
      setStatus(statusNext);
      setControlState(controlNext);
      setRunState(runNext);
      setPresets(presetsNext ?? { left_arm: [], right_arm: [] });
      setActionGroups(actionGroupsNext?.groups ?? []);
      setCurrentRecording(recordingsNext?.current ?? { active: false });
      setRecordings(recordingsNext?.recordings ?? []);
    });
  }

  async function performAction(title: string, task: () => Promise<unknown>) {
    setPendingAction(title);
    try {
      const payload = await task();
      setLastAction({ title, ok: isActionSuccess(payload), payload });
    } finally {
      setPendingAction(null);
      void refreshStatus();
    }
  }

  async function stopActiveJog(reason = "released") {
    if (!activeJogArmRef.current) {
      return;
    }
    const arm = activeJogArmRef.current;
    activeJogArmRef.current = null;
    activeJogKeyRef.current = null;
    setActiveJogKey(null);
    const payload = await postJson("/api/control/arm/jog/stop", { arm, reason });
    setLastAction({ title: `${arm} 停止连续点动`, ok: isActionSuccess(payload), payload });
    void refreshStatus();
  }

  useEffect(() => {
    const handlePointerRelease = () => {
      void stopActiveJog("pointer_release");
    };
    window.addEventListener("pointerup", handlePointerRelease);
    window.addEventListener("blur", handlePointerRelease);
    return () => {
      window.removeEventListener("pointerup", handlePointerRelease);
      window.removeEventListener("blur", handlePointerRelease);
    };
  }, []);

  async function startBringup() {
    await performAction("应用并启动", () => postJson("/api/bringup/start", bringupForm));
  }

  async function restartBringup() {
    await performAction("应用并重启", () => postJson("/api/bringup/restart", bringupForm));
  }

  async function stopBringup() {
    await performAction("停止 bringup", () => postJson("/api/bringup/stop"));
  }

  async function applyPreset(mode: "software" | "vision" | "hardware") {
    const nextConfig =
      mode === "software"
        ? {
            ...bringupForm,
            start_hardware: false,
            start_detector: false,
            start_camera_bridge: false,
            use_mock_camera_stream: false,
            publish_fake_joint_states: false,
          }
        : mode === "vision"
          ? {
              ...bringupForm,
              start_hardware: true,
              start_detector: true,
              start_camera_bridge: true,
              use_mock_camera_stream: false,
              publish_fake_joint_states: false,
            }
          : {
              ...bringupForm,
              start_hardware: true,
              start_detector: false,
              start_camera_bridge: false,
              use_mock_camera_stream: false,
              publish_fake_joint_states: false,
            };
    setBringupForm(nextConfig);
    await performAction(`切换到 ${mode} 模式`, () => postJson("/api/bringup/restart", nextConfig));
  }

  async function runCompetition() {
    await performAction("整轮比赛", async () => {
      const result = await postJson<RunState>("/api/tasks/run", { requested_order: "handover,pouring" });
      startTransition(() => setRunState(result));
      return result;
    });
  }

  async function resumeLatest() {
    await performAction("从断点恢复", async () => {
      const result = await postJson<RunState>("/api/tasks/resume-latest");
      startTransition(() => setRunState(result));
      return result;
    });
  }

  async function runAcceptance(wave: string) {
    await performAction(`${wave} 验收`, async () => {
      const result = await postJson<AcceptanceResult>(`/api/acceptance/run/${wave}`);
      if (result) {
        startTransition(() => {
          setAcceptance((current) => ({ ...current, [wave]: result }));
        });
      }
      return result;
    });
  }

  async function startRecording() {
    await performAction("开始动作录制", async () => {
      const result = await postJson<RecordingEnvelope>("/api/recordings/start", {
        name: recordingName,
        sample_interval_ms: recordingInterval,
      });
      if (result?.current) {
        startTransition(() => {
          setCurrentRecording(result.current);
          setRecordingName("");
        });
      }
      return result;
    });
  }

  async function markRecording() {
    await performAction("添加录制标记", async () => {
      const result = await postJson("/api/recordings/mark", {
        label: recordingMark,
      });
      if (result) {
        startTransition(() => setRecordingMark(""));
      }
      return result;
    });
  }

  async function stopRecording() {
    await performAction("停止动作录制", async () => {
      const result = await postJson<{ recording?: RecordingDetail; recordings?: RecordingSummary[] }>("/api/recordings/stop");
      if (result?.recording) {
        startTransition(() => {
          setSelectedRecording(result.recording ?? null);
          setCurrentRecording({ active: false });
          setRecordings(result.recordings ?? []);
        });
      }
      return result;
    });
  }

  async function viewRecording(recordingId: string) {
    await performAction("查看录制", async () => {
      const result = await fetchJson<RecordingDetail>(`/api/recordings/${recordingId}`);
      if (result) {
        startTransition(() => setSelectedRecording(result));
      }
      return result;
    });
  }

  async function deleteRecording(recordingId: string) {
    await performAction("删除录制", () => deleteJson(`/api/recordings/${recordingId}`));
  }

  async function startJogHold(arm: "left_arm" | "right_arm", axis: string, direction: 1 | -1) {
    const jogKey = `${arm}:${axis}:${direction}`;
    if (activeJogKeyRef.current === jogKey) {
      return;
    }
    if (activeJogArmRef.current && activeJogArmRef.current !== arm) {
      await stopActiveJog("switch_arm");
    }
    activeJogArmRef.current = arm;
    activeJogKeyRef.current = jogKey;
    setActiveJogKey(jogKey);
    const payload = await postJson("/api/control/arm/jog/start", {
      arm,
      axis,
      delta_mm: jogDelta * direction,
      velocity: jogVelocity,
      acceleration: jogVelocity,
      interval_ms: 220,
    });
    if (!isActionSuccess(payload)) {
      activeJogArmRef.current = null;
      activeJogKeyRef.current = null;
      setActiveJogKey(null);
    }
    setLastAction({ title: `${arm} ${axis} 连续点动`, ok: isActionSuccess(payload), payload });
    void refreshStatus();
  }

  async function armModeAction(arm: "left_arm" | "right_arm", action: "manual" | "recover") {
    await performAction(`${arm} ${action}`, () =>
      postJson("/api/control/arm/mode", {
        arm,
        action,
      }),
    );
  }

  async function gripperAction(arm: "left_arm" | "right_arm", action: "enable" | "open" | "close" | "custom") {
    await performAction(`${arm} ${action}`, () =>
      postJson("/api/control/gripper", {
        arm,
        action,
        position: gripperPosition,
        speed: gripperSpeed,
        torque: gripperTorque,
      }),
    );
  }

  async function saveCurrentPreset(arm: "left_arm" | "right_arm") {
    const name = presetNames[arm].trim();
    await performAction(`${arm} 保存当前姿态`, async () => {
      const result = await postJson<{ presets: PosePresetMap }>("/api/presets/current", { arm, name });
      if (result?.presets) {
        startTransition(() => {
          setPresets(result.presets);
          setPresetNames((current) => ({ ...current, [arm]: "" }));
        });
      }
      return result;
    });
  }

  function appendPresetToActionGroup(arm: "left_arm" | "right_arm", preset: PosePreset) {
    setDraftActionGroupSteps((current) => [
      ...current,
      {
        arm,
        preset_id: preset.id,
        include_gripper: Boolean(preset.gripper_state?.success),
        delay_ms: 0,
        stop_on_failure: true,
      },
    ]);
  }

  function updateActionGroupStep(index: number, patch: Partial<ActionGroupStep>) {
    setDraftActionGroupSteps((current) =>
      current.map((step, currentIndex) => (currentIndex === index ? { ...step, ...patch } : step)),
    );
  }

  function moveActionGroupStep(index: number, direction: -1 | 1) {
    setDraftActionGroupSteps((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }

  function removeActionGroupStep(index: number) {
    setDraftActionGroupSteps((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function saveActionGroup() {
    await performAction("保存动作组", async () => {
      const result = await postJson<{ groups?: ActionGroup[] }>("/api/action-groups", {
        name: actionGroupName,
        steps: draftActionGroupSteps,
      });
      if (result?.groups) {
        startTransition(() => {
          setActionGroups(result.groups);
          setActionGroupName("");
          setDraftActionGroupSteps([]);
        });
      }
      return result;
    });
  }

  async function runActionGroup(groupId: string) {
    await performAction("动作组回放", () =>
      postJson("/api/action-groups/run", {
        group_id: groupId,
        velocity: presetVelocity,
        acceleration: presetAcceleration,
      }),
    );
  }

  async function deleteActionGroup(groupId: string) {
    await performAction("删除动作组", () => deleteJson(`/api/action-groups/${groupId}`));
  }

  async function moveToPreset(arm: "left_arm" | "right_arm", presetId: string) {
    await performAction(`${arm} 切换姿态`, () =>
      postJson("/api/presets/move", {
        arm,
        preset_id: presetId,
        velocity: presetVelocity,
        acceleration: presetAcceleration,
      }),
    );
  }

  async function deletePreset(arm: "left_arm" | "right_arm", presetId: string) {
    await performAction(`${arm} 删除姿态`, () => deleteJson(`/api/presets/${arm}/${presetId}`));
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>dual-arm</h1>
          <p>control console</p>
        </div>
        <nav>
          {sections.map((section) => (
            <button key={section} type="button" className="nav-item">
              {section}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className={`status-pill ${status?.core_running ? "ok" : "idle"}`}>
            {status?.core_running ? "core running" : "core stopped"}
          </span>
        </div>
      </aside>

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">统一 bringup / 控制 / 验收入口</p>
            <h2>从网页直接起链路、点动机械臂、操作左右夹爪</h2>
            <p>
              当前网页直接调用 `competition_console_api`，后端再桥接 `competition_core`、`/L|R/robot_move_cart`
              和 `/execution/set_gripper`。
            </p>
          </div>
          <div className="hero-status">
            <span className={`status-pill ${health?.status === "ok" ? "ok" : "warn"}`}>
              api {health?.status ?? "unknown"}
            </span>
            <span className={`status-pill ${controlState?.left_robot ? "ok" : "idle"}`}>left</span>
            <span className={`status-pill ${controlState?.right_robot ? "ok" : "idle"}`}>right</span>
          </div>
        </section>

        {!status?.core_running ? (
          <section className="warning-banner">
            当前 core 未运行，而且最近一次配置里
            {" "}
            <code>start_hardware={String(status?.last_bringup_request?.start_hardware ?? false)}</code>
            。
            如果要控制机械臂和夹爪，先点“真机无视觉”或“视觉模式重启”，再点“应用并重启”。
          </section>
        ) : null}

        {lastAction ? (
          <section className={`action-banner ${lastAction.ok ? "ok" : "warn"}`}>
            <strong>{lastAction.title}</strong>
            <pre>{JSON.stringify(lastAction.payload, null, 2)}</pre>
          </section>
        ) : null}

        <section className="panel-grid">
          <article className="panel panel-wide">
            <div className="panel-header">
              <div>
                <h3>Bringup 配置</h3>
                <p>先选模式，再从网页直接启动或重启核心链路。</p>
              </div>
              <div className="button-row">
                <button type="button" onClick={() => void applyPreset("software")}>纯软件模式</button>
                <button type="button" onClick={() => void applyPreset("hardware")}>真机无视觉</button>
                <button type="button" onClick={() => void applyPreset("vision")}>视觉模式重启</button>
              </div>
            </div>
            <div className="form-grid">
              <label>
                <span>左臂 IP</span>
                <input value={bringupForm.left_robot_ip} onChange={(event) => updateBringupField("left_robot_ip", event.target.value)} />
              </label>
              <label>
                <span>右臂 IP</span>
                <input value={bringupForm.right_robot_ip} onChange={(event) => updateBringupField("right_robot_ip", event.target.value)} />
              </label>
              <label>
                <span>彩色设备</span>
                <input value={bringupForm.camera_color_device} onChange={(event) => updateBringupField("camera_color_device", event.target.value)} />
              </label>
              <label>
                <span>深度设备</span>
                <input value={bringupForm.camera_depth_device} onChange={(event) => updateBringupField("camera_depth_device", event.target.value)} />
              </label>
              <label>
                <span>深度后端</span>
                <input value={bringupForm.camera_depth_backend} onChange={(event) => updateBringupField("camera_depth_backend", event.target.value)} />
              </label>
            </div>
            <div className="toggle-grid">
              <label><input type="checkbox" checked={bringupForm.start_hardware} onChange={(event) => updateBringupField("start_hardware", event.target.checked)} /> 启动真机</label>
              <label><input type="checkbox" checked={bringupForm.start_detector} onChange={(event) => updateBringupField("start_detector", event.target.checked)} /> 启动模型检测</label>
              <label><input type="checkbox" checked={bringupForm.start_camera_bridge} onChange={(event) => updateBringupField("start_camera_bridge", event.target.checked)} /> 启动相机桥</label>
              <label><input type="checkbox" checked={bringupForm.use_mock_camera_stream} onChange={(event) => updateBringupField("use_mock_camera_stream", event.target.checked)} /> 使用 mock 相机</label>
              <label><input type="checkbox" checked={bringupForm.publish_fake_joint_states} onChange={(event) => updateBringupField("publish_fake_joint_states", event.target.checked)} /> fake joint states</label>
            </div>
            <div className="button-row">
              <button type="button" onClick={() => void startBringup()}>应用并启动</button>
              <button type="button" onClick={() => void restartBringup()}>应用并重启</button>
              <button type="button" onClick={() => void stopBringup()}>停止 bringup</button>
            </div>
          </article>

          <article className="panel panel-wide recording-panel">
            <div className="panel-header">
              <div>
                <h3>动作录制</h3>
                <p>你可以在官方网页操作左右臂；这里按固定频率记录 ROS 状态、夹爪状态和本控制台发出的事件。</p>
              </div>
              <span className={`status-pill ${currentRecording.active ? "ok" : "idle"}`}>
                {currentRecording.active ? "recording" : "idle"}
              </span>
            </div>
            <div className="recording-grid">
              <div className="control-card">
                <h4>录制控制</h4>
                <div className="form-grid compact-form">
                  <label>
                    <span>录制名称</span>
                    <input
                      value={recordingName}
                      placeholder="例如：手把手倒水演示"
                      onChange={(event) => setRecordingName(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>采样间隔 ms</span>
                    <input
                      type="number"
                      value={recordingInterval}
                      onChange={(event) => setRecordingInterval(Number(event.target.value) || 200)}
                    />
                  </label>
                  <label>
                    <span>标记文本</span>
                    <input
                      value={recordingMark}
                      placeholder="夹取 / 倒水 / 放置"
                      onChange={(event) => setRecordingMark(event.target.value)}
                    />
                  </label>
                </div>
                <div className="button-row">
                  <button type="button" disabled={currentRecording.active} onClick={() => void startRecording()}>开始录制</button>
                  <button type="button" disabled={!currentRecording.active} onClick={() => void markRecording()}>添加标记</button>
                  <button type="button" disabled={!currentRecording.active} onClick={() => void stopRecording()}>停止并保存</button>
                </div>
                <p className="robot-meta">
                  当前：
                  {" "}
                  {currentRecording.active
                    ? `${currentRecording.name ?? currentRecording.id} / samples=${currentRecording.sample_count ?? 0} / events=${currentRecording.event_count ?? 0}`
                    : "未录制"}
                </p>
              </div>
              <div className="control-card">
                <h4>录制历史</h4>
                <div className="recording-list">
                  {recordings.length === 0 ? (
                    <p className="empty-state">还没有保存的录制。</p>
                  ) : (
                    recordings.slice(0, 6).map((recording) => (
                      <div key={recording.id} className="recording-item">
                        <div>
                          <strong>{recording.name}</strong>
                          <p>{recording.started_at} / {recording.sample_count} samples / {recording.event_count} events</p>
                        </div>
                        <div className="button-row compact">
                          <button type="button" onClick={() => void viewRecording(recording.id)}>查看</button>
                          <button type="button" onClick={() => void deleteRecording(recording.id)}>删除</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {selectedRecording ? (
              <div className="recording-preview">
                <h4>录制预览：{selectedRecording.name}</h4>
                <p>
                  {selectedRecording.sample_count ?? selectedRecording.samples?.length ?? 0}
                  {" "}
                  samples，
                  {selectedRecording.event_count ?? selectedRecording.events?.length ?? 0}
                  {" "}
                  events。完整文件保存在 `.artifacts/console_recordings/`。
                </p>
                <pre>{JSON.stringify({
                  id: selectedRecording.id,
                  started_at: selectedRecording.started_at,
                  stopped_at: selectedRecording.stopped_at,
                  first_sample: selectedRecording.samples?.[0],
                  last_sample: selectedRecording.samples?.[selectedRecording.samples.length - 1],
                  events: selectedRecording.events,
                }, null, 2)}</pre>
              </div>
            ) : null}
          </article>

          <article className="panel panel-wide">
            <div className="panel-header">
              <div>
                <h3>机械臂控制</h3>
                <p>平移单位 mm，旋转单位 deg。按住按钮连续点动，松开立即停止，后端做 repeat guard。</p>
              </div>
              <div className="inline-settings">
                <label>
                  <span>步长</span>
                  <input type="number" value={jogDelta} onChange={(event) => setJogDelta(Number(event.target.value) || 0)} />
                </label>
                <label>
                  <span>速度</span>
                  <input type="number" value={jogVelocity} onChange={(event) => setJogVelocity(Number(event.target.value) || 0)} />
                </label>
              </div>
            </div>
            <div className="robot-grid">
              {([
                { key: "left_arm", label: "左臂", state: controlState?.left_robot ?? null },
                { key: "right_arm", label: "右臂", state: controlState?.right_robot ?? null },
              ] as const).map((arm) => (
                <div key={arm.key} className="control-card">
                  <RobotSummary title={arm.label} state={arm.state} />
                  <div className="button-row compact">
                    <button type="button" onClick={() => void armModeAction(arm.key, "manual")}>
                      {arm.label}切手动
                    </button>
                    <button type="button" onClick={() => void armModeAction(arm.key, "recover")}>
                      {arm.label}退出拖动
                    </button>
                  </div>
                  <p className="jog-hint">
                    {controlState?.jog_state?.[arm.key]?.active
                      ? `连续点动中: ${controlState.jog_state[arm.key]?.axis ?? "--"}`
                      : "按住任一方向键开始连续点动"}
                  </p>
                  <div className="axis-grid">
                    {jogAxes.map((axis) => (
                      <div key={`${arm.key}-${axis.key}`} className="axis-row">
                        <button
                          type="button"
                          className={activeJogKey === `${arm.key}:${axis.key}:-1` ? "jog-button active" : "jog-button"}
                          disabled={!status?.core_running}
                          onPointerDown={(event) => {
                            event.preventDefault();
                            void startJogHold(arm.key, axis.key, -1);
                          }}
                          onPointerUp={(event) => {
                            event.preventDefault();
                            void stopActiveJog();
                          }}
                          onPointerLeave={() => void stopActiveJog()}
                          onPointerCancel={() => void stopActiveJog()}
                        >
                          {arm.label} {axis.label}-
                        </button>
                        <button
                          type="button"
                          className={activeJogKey === `${arm.key}:${axis.key}:1` ? "jog-button active" : "jog-button"}
                          disabled={!status?.core_running}
                          onPointerDown={(event) => {
                            event.preventDefault();
                            void startJogHold(arm.key, axis.key, 1);
                          }}
                          onPointerUp={(event) => {
                            event.preventDefault();
                            void stopActiveJog();
                          }}
                          onPointerLeave={() => void stopActiveJog()}
                          onPointerCancel={() => void stopActiveJog()}
                        >
                          {arm.label} {axis.label}+
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h3>夹爪控制</h3>
                <p>左右夹爪已拆分到独立 backend，网页走 `/execution/set_gripper` 统一调用。</p>
              </div>
              <div className="inline-settings">
                <label>
                  <span>位置</span>
                  <input type="number" value={gripperPosition} onChange={(event) => setGripperPosition(Number(event.target.value) || 0)} />
                </label>
                <label>
                  <span>速度</span>
                  <input type="number" value={gripperSpeed} onChange={(event) => setGripperSpeed(Number(event.target.value) || 0)} />
                </label>
                <label>
                  <span>力矩</span>
                  <input type="number" value={gripperTorque} onChange={(event) => setGripperTorque(Number(event.target.value) || 0)} />
                </label>
              </div>
            </div>
            <div className="gripper-grid">
              {([
                { key: "left_arm", label: "左夹爪" },
                { key: "right_arm", label: "右夹爪" },
              ] as const).map((gripper) => (
                <div key={gripper.key} className="control-card">
                  <h4>{gripper.label}</h4>
                  <div className="button-grid">
                    <button type="button" disabled={!status?.core_running} onClick={() => void gripperAction(gripper.key, "enable")}>{gripper.label}使能</button>
                    <button type="button" disabled={!status?.core_running} onClick={() => void gripperAction(gripper.key, "open")}>{gripper.label}打开</button>
                    <button type="button" disabled={!status?.core_running} onClick={() => void gripperAction(gripper.key, "close")}>{gripper.label}闭合</button>
                    <button type="button" disabled={!status?.core_running} onClick={() => void gripperAction(gripper.key, "custom")}>{gripper.label}自定义</button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel panel-wide">
            <div className="panel-header">
              <div>
                <h3>自定义姿态库</h3>
                <p>手动把机械臂摆到目标位后，直接保存当前关节角。左右臂分开管理，可命名、可多条保存、可一键回位。</p>
              </div>
              <div className="inline-settings">
                <label>
                  <span>切换速度</span>
                  <input type="number" value={presetVelocity} onChange={(event) => setPresetVelocity(Number(event.target.value) || 0)} />
                </label>
                <label>
                  <span>切换加速度</span>
                  <input type="number" value={presetAcceleration} onChange={(event) => setPresetAcceleration(Number(event.target.value) || 0)} />
                </label>
              </div>
            </div>
            <div className="robot-grid">
              {([
                { key: "left_arm", label: "左臂姿态" },
                { key: "right_arm", label: "右臂姿态" },
              ] as const).map((arm) => (
                <div key={arm.key} className="control-card">
                  <div className="preset-header">
                    <h4>{arm.label}</h4>
                    <div className="preset-save-row">
                      <input
                        value={presetNames[arm.key]}
                        placeholder="输入姿态名称"
                        onChange={(event) =>
                          setPresetNames((current) => ({ ...current, [arm.key]: event.target.value }))
                        }
                      />
                      <button
                        type="button"
                        disabled={!status?.core_running || !(arm.key === "left_arm" ? controlState?.left_robot : controlState?.right_robot)}
                        onClick={() => void saveCurrentPreset(arm.key)}
                      >
                        保存当前位姿
                      </button>
                    </div>
                  </div>
                  <div className="preset-list">
                    {presets[arm.key].length === 0 ? (
                      <p className="empty-state">还没有保存的姿态。</p>
                    ) : (
                      presets[arm.key].map((preset) => (
                        <div key={preset.id} className="preset-item">
                          <div>
                            <strong>{preset.name}</strong>
                            <p>{preset.created_at}</p>
                            <p>
                              joints:
                              {" "}
                              {preset.joint_positions.map((value) => value.toFixed(1)).join(", ")}
                            </p>
                            <p>{describeGripperSnapshot(preset.gripper_state)}</p>
                          </div>
                          <div className="button-column">
                            <button type="button" disabled={!status?.core_running} onClick={() => void moveToPreset(arm.key, preset.id)}>切换</button>
                            <button type="button" onClick={() => appendPresetToActionGroup(arm.key, preset)}>加入动作组</button>
                            <button type="button" onClick={() => void deletePreset(arm.key, preset.id)}>删除</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel panel-wide">
            <div className="panel-header">
              <div>
                <h3>动作组</h3>
                <p>把左右臂姿态按顺序编排为动作组，每步可决定是否带夹爪、延时和失败即停。</p>
              </div>
              <div className="inline-settings">
                <label>
                  <span>回放速度</span>
                  <input type="number" value={presetVelocity} onChange={(event) => setPresetVelocity(Number(event.target.value) || 0)} />
                </label>
                <label>
                  <span>回放加速度</span>
                  <input type="number" value={presetAcceleration} onChange={(event) => setPresetAcceleration(Number(event.target.value) || 0)} />
                </label>
              </div>
            </div>
            <div className="action-group-layout">
              <div className="control-card">
                <div className="preset-save-row">
                  <input
                    value={actionGroupName}
                    placeholder="输入动作组名称"
                    onChange={(event) => setActionGroupName(event.target.value)}
                  />
                  <button
                    type="button"
                    disabled={draftActionGroupSteps.length === 0 || actionGroupName.trim().length === 0}
                    onClick={() => void saveActionGroup()}
                  >
                    保存动作组
                  </button>
                </div>
                <div className="action-step-list">
                  {draftActionGroupSteps.length === 0 ? (
                    <p className="empty-state">先从姿态卡里点“加入动作组”，再在这里调整顺序和每步选项。</p>
                  ) : (
                    draftActionGroupSteps.map((step, index) => {
                      const preset = presets[step.arm].find((item) => item.id === step.preset_id);
                      return (
                        <div key={`${step.arm}-${step.preset_id}-${index}`} className="action-step-card">
                          <div>
                            <strong>
                              Step {index + 1}
                              {" "}
                              {step.arm === "left_arm" ? "左臂" : "右臂"}
                              {" "}
                              {preset?.name ?? step.preset_id}
                            </strong>
                            <p>{describeGripperSnapshot(preset?.gripper_state)}</p>
                          </div>
                          <div className="action-step-controls">
                            <label>
                              <span>延时 ms</span>
                              <input
                                type="number"
                                value={step.delay_ms}
                                onChange={(event) => updateActionGroupStep(index, { delay_ms: Number(event.target.value) || 0 })}
                              />
                            </label>
                            <label className="toggle-chip">
                              <input
                                type="checkbox"
                                checked={step.include_gripper}
                                onChange={(event) => updateActionGroupStep(index, { include_gripper: event.target.checked })}
                              />
                              带夹爪
                            </label>
                            <label className="toggle-chip">
                              <input
                                type="checkbox"
                                checked={step.stop_on_failure}
                                onChange={(event) => updateActionGroupStep(index, { stop_on_failure: event.target.checked })}
                              />
                              失败即停
                            </label>
                            <div className="button-row compact">
                              <button type="button" onClick={() => moveActionGroupStep(index, -1)}>上移</button>
                              <button type="button" onClick={() => moveActionGroupStep(index, 1)}>下移</button>
                              <button type="button" onClick={() => removeActionGroupStep(index)}>删除</button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="control-card">
                <h4>已保存动作组</h4>
                <div className="action-step-list">
                  {actionGroups.length === 0 ? (
                    <p className="empty-state">还没有动作组。</p>
                  ) : (
                    actionGroups.map((group) => (
                      <div key={group.id} className="action-step-card">
                        <div>
                          <strong>{group.name}</strong>
                          <p>{group.created_at}</p>
                          <p>
                            {group.steps.map((step, index) => {
                              const preset = presets[step.arm].find((item) => item.id === step.preset_id);
                              return `${index + 1}.${step.arm === "left_arm" ? "左" : "右"}-${preset?.name ?? step.preset_id}`;
                            }).join(" -> ")}
                          </p>
                        </div>
                        <div className="button-column">
                          <button type="button" disabled={!status?.core_running} onClick={() => void runActionGroup(group.id)}>回放</button>
                          <button type="button" onClick={() => void deleteActionGroup(group.id)}>删除</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </article>

          <article className="panel">
            <h3>运行态 / 最近动作</h3>
            <div className="status-stack">
              <pre>{JSON.stringify({ health, status, controlState, runState, presets, actionGroups }, null, 2)}</pre>
              <pre>{JSON.stringify({ pendingAction, lastAction }, null, 2)}</pre>
            </div>
          </article>

          <article className="panel panel-wide">
            <h3>验收与任务入口</h3>
            <div className="button-grid wide">
              <button type="button" onClick={() => void runAcceptance("workspace")}>工作区验收</button>
              <button type="button" onClick={() => void runAcceptance("camera_frames")}>相机 frame 验收</button>
              <button type="button" onClick={() => void runAcceptance("planning_scene")}>PlanningScene smoke</button>
              <button type="button" onClick={() => void runAcceptance("resume")}>接续 smoke</button>
              <button type="button" onClick={() => void runAcceptance("web_console")}>网页验收</button>
              <button type="button" onClick={() => void runCompetition()}>整轮比赛</button>
              <button type="button" onClick={() => void resumeLatest()}>从断点恢复</button>
            </div>
            <pre>{JSON.stringify(acceptance, null, 2)}</pre>
          </article>
        </section>
      </main>
    </div>
  );
}
