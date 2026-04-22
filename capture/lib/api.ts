import { z } from "zod";
import { useApp } from "./store";
import {
  PreflightResult,
  PreflightResultSchema,
  Scene,
  SceneSchema,
} from "./types";

export async function uploadScene(
  localUri: string,
  title: string,
  onProgress?: (pct: number) => void,
): Promise<Scene> {
  const { apiBaseUrl } = useApp.getState();
  const form = new FormData();
  form.append("title", title);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form.append("video", { uri: localUri, name: "capture.mp4", type: "video/mp4" } as any);

  // fetch() on RN doesn't emit upload progress reliably; use XHR.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiBaseUrl}/scenes`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(SceneSchema.parse(JSON.parse(xhr.responseText)));
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText.slice(0, 200)}`));
      }
    };
    xhr.onerror = () => reject(new Error("network error"));
    xhr.send(form);
  });
}

export async function getScene(serverId: string): Promise<Scene> {
  const { apiBaseUrl } = useApp.getState();
  const r = await fetch(`${apiBaseUrl}/scenes/${serverId}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return SceneSchema.parse(await r.json());
}

export async function preflight(localUri: string): Promise<PreflightResult> {
  const { apiBaseUrl } = useApp.getState();
  const form = new FormData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form.append("video", { uri: localUri, name: "clip.mp4", type: "video/mp4" } as any);
  const r = await fetch(`${apiBaseUrl}/preflight`, { method: "POST", body: form });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return PreflightResultSchema.parse(await r.json());
}

// Lightweight client-side id so scenes have ids before the server sees them.
export function localId(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const VIEWER_URL = (serverId: string): string =>
  `${useApp.getState().apiBaseUrl.replace(/:\d+$/, ":3000")}/scenes/${serverId}`;

export function healthzUrl(): string {
  return `${useApp.getState().apiBaseUrl}/healthz`;
}

// Poll helper
export async function pollScene(serverId: string, ms = 4000): Promise<Scene> {
  for (;;) {
    const s = await getScene(serverId);
    if (s.status === "ready" || s.status === "failed") return s;
    await new Promise((r) => setTimeout(r, ms));
  }
}

// Lightweight schema reuse
export const ApiSceneSchema = SceneSchema;
export type { Scene, PreflightResult };
export { z };
