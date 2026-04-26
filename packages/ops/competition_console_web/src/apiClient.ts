export async function fetchJson<T>(path: string): Promise<T | null> {
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

export async function postJson<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = (await response.json().catch(() => null)) as T | null;
    if (!response.ok) {
      return payload;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function deleteJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path, { method: "DELETE" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
