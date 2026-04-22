# splat-capture

Expo capture app for `splat-studio`. Shoot an orbit video on your phone,
upload to the training server, watch the gsplat pipeline progress, then tap
through to the existing web viewer.

## Why mobile

Capture is where phones beat laptops — you hold the camera, you walk the
orbit, you feel the framing. The viewer stays web (installed-base reach,
WebGL2/WebGPU ecosystem); capture comes to the phone.

## Stack

- Expo SDK 52 + Expo Router v4
- `expo-camera` v16 (video mode, cinematic stabilization)
- `expo-media-library`, `expo-file-system` for capture persistence
- NativeWind v4, Zustand for local scene list, TanStack Query for polling
- Zod for API response validation

## Screens

| Route                | Purpose                                             |
|----------------------|-----------------------------------------------------|
| `/(tabs)/`           | Scene list — local + uploaded + training + ready    |
| `/(tabs)/settings`   | Training API base URL                               |
| `/capture`           | Camera preview with orbit coaching, record timer    |
| `/scene/[id]`        | Upload, pipeline progress, "Open in viewer" button  |

## Pipeline handoff

The server contract mirrors the training pipeline (`training/pipeline.py`):

- `POST /preflight` → blur / exposure / overlap scores + warnings
- `POST /scenes` (multipart `video` + `title`) → `Scene` with `server_id`
- `GET  /scenes/:id` → Scene with `stage` ∈ {`preflight`, `frames`,
  `colmap:sparse`, `colmap:bundle`, `train`, `densify`, `export`, `upload`,
  `done`, `failed`} and `progress ∈ [0,1]`

Status transitions map directly onto Level 1 of `docs/DFD.md`.

## Run

```bash
cd capture
pnpm install
pnpm start
pnpm android | pnpm ios
```

Point the API base URL at your GPU host running `training/`.

## Coaching

The capture screen shows four always-on orbit rules (steady orbit, framing,
angle coverage, reflection avoidance). An accelerometer-driven overlay for
live orbit coverage is a follow-up — this version focuses on ship-able
capture + upload + progress.
