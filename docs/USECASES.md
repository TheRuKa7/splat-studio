# USECASES — splat-studio

End-to-end flows for a Gaussian-Splatting pipeline: video → COLMAP poses →
gsplat training → web viewer, with a focus on making capture-to-viewer fast
and failure modes legible.

## 1. Personas

| ID | Persona | Context | Primary JTBD |
|----|---------|---------|--------------|
| P1 | **Real-estate photographer (Marisol)** | Shoots 20 listings/month; wants interactive tours | "Phone video → embeddable viewer in 30 min" |
| P2 | **Heritage preservation researcher (Kenji)** | Documenting endangered temples | "Archive a scene as a high-quality splat I can host for decades" |
| P3 | **Indie game dev (Anders)** | Wants scanned sets for a puzzle game | "Export a splat I can drop into Unity" |
| P4 | **Portfolio evaluator (Priya PM)** | 20-minute evaluator of the repo | "Can this actually produce a splat from a phone clip?" |
| P5 | **ML eng comparing 3DGS vs 2DGS vs NeRF** | Picking a technique | "Show me training curves + viewer artefacts; honest tradeoffs" |

## 2. Jobs-to-be-done

JTBD-1. **Preflight** a capture for COLMAP success (blur, exposure, coverage).
JTBD-2. **Train** a 3DGS / 2DGS scene with repeatable configs.
JTBD-3. **Serve** the trained scene in a browser viewer with mobile perf OK.
JTBD-4. **Debug** a bad reconstruction (feature coverage, pose failure).
JTBD-5. **Export** to formats usable by game engines / other viewers.
JTBD-6. **Manage scenes** — a small catalog with thumbnails and URLs.

## 3. End-to-end flows

### Flow A — Marisol: listing video → embed

1. Shoots a 60-second 4K video of the living room.
2. `splat-studio preflight --video liv.mp4` — warns on motion blur and fast pans.
3. `splat-studio train --video liv.mp4 --scene liv-01 --budget 15min`.
4. Training: extract frames → COLMAP sparse → gsplat 20k iters on A10G.
5. Ships viewer URL; Marisol pastes it into the MLS listing.

### Flow B — Kenji: heritage scene archival

1. Photogrammetrist captures ~500 DSLR photos around the temple.
2. Pipeline uses high-quality COLMAP parameters (dense + loop-closure).
3. Trains 3DGS with extended iterations + density control.
4. Exports to `.ply` and `.ksplat`; mirrors to two object stores.
5. Viewer page renders with metadata card: capture date, gear, license.

### Flow C — Anders: splat for a game

1. Trains scene from his phone tour.
2. Runs `splat-studio export --format unity --scene puzzle-room`.
3. Gets a `.splat` + a lightweight Unity plugin hint.
4. Drops into Unity scene; quality-budgeted LOD version provided.

### Flow D — Priya's 20-minute evaluation

1. Clones repo, reads README; sees the capture-to-viewer diagram.
2. Runs `docker compose up training viewer` against a sample video.
3. Opens localhost:3000 → sees a pre-rendered sample scene.
4. Opens `docs/CAPTURE.md` for failure-mode documentation.
5. Writes memo: "Solid pipeline; honest about COLMAP fragility."

### Flow E — ML researcher compares techniques

1. Runs `splat-studio train --method 3dgs,2dgs --scene same-capture`.
2. Logs go to wandb; side-by-side training curves + viewer screenshots.
3. Reads `docs/THINK.md` — sees tradeoffs: 2DGS cleaner surfaces, 3DGS fuller volume.

### Flow F — Contributor swaps COLMAP for GLOMAP

1. Clones; implements `GlomapPoseEstimator(BasePoseEstimator)` in `training/`.
2. Adds a preflight check for GLOMAP-compatible capture patterns.
3. `uv run pytest` passes; PR ships; CI's sample-video E2E still green.

## 4. Acceptance scenarios

```gherkin
Scenario: Preflight rejects a shaky capture
  Given a video with median frame-motion blur > threshold
  When I run splat-studio preflight --video shaky.mp4
  Then the exit code is non-zero
  And the report flags "motion_blur" with a remediation tip

Scenario: COLMAP failure is legible
  Given a capture with insufficient overlap
  When COLMAP pose estimation fails
  Then splat-studio surfaces a structured error with stage="colmap:sparse"
  And links to docs/CAPTURE.md#overlap

Scenario: Viewer loads on mobile
  Given a trained scene hosted on Cloudflare R2
  When I open the viewer URL on an iPhone 13
  Then first paint is under 3 seconds on 4G
  And FPS is >= 30 after initial load

Scenario: Scene manifest is valid
  When I add a scene to scenes.json
  Then the build step validates it against scenes.schema.json
  And a malformed URL or missing thumbnail fails CI
```

## 5. Non-use-cases

- Photogrammetric measurement (metric accuracy is not guaranteed)
- Dynamic scenes (people walking through); 4D splats are P3+
- Real-time capture-to-splat (minutes, not seconds)
- Copyrighted-space capture without permission (responsibility on user)
