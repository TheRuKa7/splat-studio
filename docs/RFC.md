# RFC-001 — splat-studio pipeline + viewer

**Author:** Rushil Kaul · **Status:** Draft · **Target release:** P1–P2

## 1. Summary

Two-app monorepo: `training/` (Python, runs on a GPU VM) and `viewer/`
(Next.js static site). The training pipeline is a linear DAG with clear
stage boundaries and structured error surfaces. The viewer is data-driven
by a validated `scenes.json` manifest and uses `mkkellogg/gaussian-splats-3d`
(MIT) as the renderer.

## 2. Context

`RESEARCH.md` covers 3DGS vs 2DGS, COLMAP vs GLOMAP, gsplat vs Nerfstudio,
and capture-pattern tradeoffs. `PRD.md` owns goals. This RFC pins the stage
contracts, config schema, manifest schema, and export formats.

## 3. Detailed design

### 3.1 Training pipeline stages

```
preflight → frames → colmap:sparse → colmap:bundle → init:pcd → gsplat:train → export → thumbnail
```

Each stage is a self-contained function:

```python
class StageResult(BaseModel):
    stage: str
    status: Literal["ok","failed","skipped"]
    metrics: dict[str, float] = {}
    artefact_paths: list[Path] = []
    error_code: str | None = None     # e.g. "colmap:insufficient_overlap"
    docs_link: str | None = None

def run_stage(cfg: SceneConfig, stage: str, prev: StageResult) -> StageResult: ...
```

### 3.2 Config schema

```python
class CaptureConfig(BaseModel):
    source: Literal["video","photos"]
    path: Path
    fps_sample: int = 4              # for video
    max_frames: int = 300

class ColmapConfig(BaseModel):
    matcher: Literal["exhaustive","sequential","spatial"] = "sequential"
    dense: bool = False

class GsplatConfig(BaseModel):
    method: Literal["3dgs","2dgs"] = "3dgs"
    iterations: int = 20000
    sh_degree: int = 3
    density_every: int = 500
    opacity_reset_every: int = 3000

class SceneConfig(BaseModel):
    scene_id: str
    capture: CaptureConfig
    colmap: ColmapConfig = ColmapConfig()
    gsplat: GsplatConfig = GsplatConfig()
    export_formats: list[Literal["ply","ksplat","splat"]] = ["ksplat"]
    budget_minutes: int | None = None
```

### 3.3 Preflight checks

| Check | Metric | Threshold | Remediation link |
|-------|--------|-----------|------------------|
| Motion blur | Laplacian variance per frame | median > 60, <10% below 30 | `CAPTURE.md#blur` |
| Exposure stability | frame-to-frame luma stddev | < 15 | `CAPTURE.md#exposure` |
| Overlap (video) | optical-flow magnitude frame-to-frame | within a band | `CAPTURE.md#overlap` |
| Count | total frames after sampling | ≥ 80 | `CAPTURE.md#count` |

### 3.4 COLMAP wrapping

- Invoked as a subprocess — never linked. Explicit license boundary.
- Stdout parsed into structured events (`stage`, `progress`, `iter_count`).
- On failure, map COLMAP's message to one of a closed set of error codes:
  `colmap:insufficient_overlap`, `colmap:not_enough_features`,
  `colmap:bundle_diverged`, `colmap:timeout`.
- Reference stage metrics stored as artefacts: `cameras.bin`, `images.bin`,
  `points3D.bin`, `images.txt` (for debugging).

### 3.5 Viewer architecture

- Static Next.js 15 app (App Router, RSC disabled for the viewer page).
- `scenes.json` + `scenes.schema.json` committed; validated at build time via a
  small TypeScript script using `ajv`.
- Each scene entry:

```json
{
  "id": "kitchen",
  "label": "Kitchen (indoor)",
  "url": "https://example.r2.dev/scenes/kitchen.ksplat",
  "thumbnail": "/thumbs/kitchen.jpg",
  "license": "CC-BY-4.0",
  "capture_date": "2026-04-10",
  "gear": "iPhone 15 Pro"
}
```

- Renderer: `@mkkellogg/gaussian-splats-3d` with `SHQ_LOW` default on mobile
  (user-agent sniff only for the first paint; a toggle overrides).
- No analytics on viewer by default; optional plausible.io stub.

### 3.6 Export formats

| Format | Use | Notes |
|--------|-----|-------|
| `.ply` | Archival, 3rd-party viewers | Largest, standard |
| `.ksplat` | Our web viewer | Smaller; produced by mkkellogg's converter |
| `.splat` | Some engines (Unity plugin) | Smallest compressed |

Conversion is scripted in `scripts/export/` and runs post-training.

### 3.7 Observability & repro

- Full wandb run per scene: training curves, loss components, PSNR proxy.
- `runs/{scene_id}/manifest.json` with git SHA, CUDA version, gsplat commit,
  config used, wall-clock per stage, peak VRAM.
- Resumable training: checkpoint every N iters; `train --resume` re-enters.

### 3.8 Error surface to the user

```
$ splat-studio train --video liv.mp4 --scene liv-01
[ok] preflight (motion_blur=0.12, exposure_var=7.3)
[ok] frames (sampled 220 frames)
[fail] colmap:sparse — error_code=colmap:insufficient_overlap
  → see docs/CAPTURE.md#overlap
  → partial artefacts at runs/liv-01/colmap/
  → retry with --colmap.matcher=exhaustive
```

## 4. Alternatives considered

| Alt | Why not |
|-----|---------|
| Nerfstudio end-to-end | Heavy dep; we want thin layers over gsplat |
| COLMAP library linkage | GPL contamination risk |
| WebGPU-only renderer | Platform coverage still uneven in mid-2026 |
| Unity-only viewer | Excludes browser use |

## 5. Tradeoffs

- Subprocess COLMAP adds IPC overhead but keeps license boundary clean.
- Pinning gsplat to a known commit vs tracking main: we pin with regular
  bumps and a sample-scene regression test.
- Building our own capture app (P3) vs relying on existing video apps: defer.

## 6. Rollout plan

1. P1 wk 1: COLMAP wrapper + preflight + structured errors.
2. P1 wk 2: gsplat training + wandb + resume + export (ply, ksplat).
3. P1 wk 3: thumbnail generator + viewer hook-up.
4. P2 wk 4–5: 2DGS path + comparison report.
5. P2 wk 6: LOD splats + mobile quality levels.

## 7. Open questions

- Capture-app: web-only vs RN? Depends on iOS file-size limits for direct upload.
- Pose-estimator abstraction (BasePoseEstimator) from day 1 or only when GLOMAP lands?
- Do we support photogrammetric ground-truth alignment for heritage users?
