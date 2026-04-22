# splat-studio

> **End-to-end Gaussian Splatting pipeline.** Video in → photoreal, real-time 3D scene in the browser. Python training (COLMAP + gsplat) + React Three Fiber WebGL viewer.

[![CI](https://github.com/TheRuKa7/splat-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/TheRuKa7/splat-studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Built by [Rushil Kaul](https://github.com/TheRuKa7) — a spatial-AI portfolio entry. Most 3DGS repos are viewers only; this one ships the whole pipeline.

## What it does

1. Upload a short 20-60s video of a static scene (or set of images)
2. Backend runs **COLMAP** for SfM → camera poses
3. Trains a **3DGS** scene with **gsplat** (NVLabs)
4. Compresses + exports to `.splat` (web-ready format)
5. Frontend streams and renders the scene in real-time via WebGL

## Stack

| Layer | Choice |
|-------|--------|
| SfM | COLMAP |
| Training | gsplat (NVLabs) via Nerfstudio |
| Backbone | 3DGS (SIGGRAPH 2023); 2DGS option for mesh-like scenes |
| Compression | SOGS (experimental) + quantization |
| Viewer | Next.js 15 + React Three Fiber + @mkkellogg/gaussian-splats-3d |
| Host | Cloudflare R2 for .splat files (too big for git) |

## Demo scenes

5 pre-computed scenes hosted on [splat-studio-scenes R2 bucket](https://example.r2.dev) (links in-app):
- Indoor: kitchen, library corner, bedroom
- Outdoor: small garden, vintage car

## Docs

- [docs/RESEARCH.md](./docs/RESEARCH.md) — 3DGS landscape, variants, viewers
- [docs/PLAN.md](./docs/PLAN.md) — phased pipeline build
- [docs/THINK.md](./docs/THINK.md) — pipeline vs viewer-only, GPU economics, hiring signals
- [docs/CAPTURE.md](./docs/CAPTURE.md) — how to record a scene (tips, failure modes)
- [docs/BENCHMARKS.md](./docs/BENCHMARKS.md) — PSNR/SSIM/LPIPS, training time, file sizes

## Quickstart

```bash
# Viewer (works standalone with hosted scenes)
cd viewer && pnpm install && pnpm dev

# Training pipeline (requires NVIDIA GPU, ~10-30 min per scene)
cd training && uv sync
uv run splat-train --video samples/kitchen.mp4 --output kitchen.splat
```

## License

MIT.
