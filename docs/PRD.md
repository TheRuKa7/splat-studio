# PRD — splat-studio

**Owner:** Rushil Kaul · **Status:** P0 scaffold complete · **Last updated:** 2026-04-22

## 1. TL;DR

An opinionated **Gaussian Splatting pipeline + web viewer**: video/photos →
COLMAP poses → gsplat training → React Three Fiber viewer. Optimised for
"phone clip → shareable URL" in under 30 minutes.

## 2. Problem

Most splat demos require an ML-researcher setup. `splat-studio` makes the
end-to-end flow reliable for non-experts, exposes legible failure modes, and
ships a working viewer.

## 3. Goals

| G | Goal | Measure |
|---|------|---------|
| G1 | Phone-clip → viewer URL in ≤ 30 min on A10G | E2E benchmark on a standard 60s clip |
| G2 | Legible failure modes | Every COLMAP/gsplat failure returns a structured error with doc link |
| G3 | Mobile-friendly viewer | First paint < 3 s on 4G; 30 FPS sustained |
| G4 | Method comparison | Train 3DGS and 2DGS from same capture; emit side-by-side report |
| G5 | Portfolio evaluability | `docker compose up` → sample scene visible in < 5 min |

## 4. Non-goals

- Photogrammetric metric accuracy
- Dynamic / 4D scenes (post-v1)
- Real-time (seconds-to-splat) processing
- A hosted SaaS offering (v2)

## 5. Users & stakeholders

P1–P5. Stakeholder: a hypothetical platform team that might host scenes
(CDN costs, abuse reporting).

## 6. Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | `preflight` CLI: scan video for motion blur, exposure, overlap | P1 |
| F2 | `train` CLI: video/photos → splat with config presets | P0 |
| F3 | COLMAP integration via subprocess with structured errors | P1 |
| F4 | gsplat training with configurable iterations + density control | P1 |
| F5 | 2DGS path alongside 3DGS | P2 |
| F6 | `export` CLI to `.ply` / `.ksplat` / `.splat` | P1 |
| F7 | React Three Fiber viewer with scene manifest | P0 |
| F8 | `scenes.json` + `scenes.schema.json` build-time validated | P0 |
| F9 | Thumbnail generator (one auto-capture per scene) | P1 |
| F10 | wandb logging of training | P1 |
| F11 | Method comparison report (3DGS vs 2DGS) | P2 |

## 7. Non-functional requirements

| Category | Requirement |
|----------|-------------|
| Performance | ≤ 30 min end-to-end on A10G for a 60 s clip |
| Ops | Training container runs on a single GPU VM; viewer runs on any static host |
| Privacy | User retains all source media; pipeline does not upload unless configured |
| Observability | wandb + structured logs; preflight report as markdown |
| Reliability | Graceful abort + resume for long training runs |
| Portability | Viewer static bundle ≤ 300 KB gzipped (excluding splat data) |

## 8. Success metrics

- **Primary:** sample-video E2E wall-clock time in CI-lite on rented GPU.
- **Secondary:** viewer Lighthouse mobile performance score.
- **Adoption:** number of scene manifests contributed via PRs.

## 9. Milestones

| Phase | Deliverable | ETA |
|-------|-------------|-----|
| P0 | Monorepo scaffold (training/ + viewer/), scene manifest, sample scene | shipped |
| P1 | COLMAP integration, gsplat training, wandb, preflight, export | +3 weeks |
| P2 | 2DGS path, method-comparison report, auto-thumbnail | +6 weeks |
| P3 | Hosted demo + abuse reporting + capture app (mobile) | +9 weeks |

## 10. Dependencies

- COLMAP (GPL-licensed — used as subprocess, never linked into our code)
- gsplat (BSD-3), Nerfstudio (optional), mkkellogg/gaussian-splats-3d (MIT)
- React Three Fiber, three.js, Tailwind
- FFmpeg (frame extraction, thumbnails)
- Python 3.13 + CUDA 12.4 runtime on the training container

## 11. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| COLMAP pose estimation fails silently | High | Bad scenes | Structured error stages + `preflight` capture rules |
| GPU cost per scene | Med | $ | Document expected A10G cost/scene; CPU preflight |
| Viewer perf on low-end phones | Med | UX | Configurable quality levels; LOD splats in P2 |
| Licensing mess (COLMAP GPL vs repo MIT) | Cert. | Legal | Subprocess-only; README explicit |
| Privacy abuse (capturing private spaces) | Med | Rep | Require capture-consent checkbox in the capture app (P3) |

## 12. Open questions

- Whether to adopt Nerfstudio as the training harness vs a thinner wrapper.
- Ship a hosted demo with a public gallery or keep the repo self-host-only?
- Capture-app UX: React Native vs web-based (MediaRecorder)?
