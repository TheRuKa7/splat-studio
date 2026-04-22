# /ultraplan — splat-studio

## Goal
End-to-end 3DGS pipeline (video → viewer) in ~12 days. Includes 5 pre-trained demo scenes.

## Phases

### P0 — Scaffold (Day 1)
- [x] Two-app monorepo: `training/` (uv Python) + `viewer/` (pnpm Next.js)
- [x] Docs: RESEARCH, PLAN, THINK, CAPTURE, BENCHMARKS
- [x] CI: Python + Node matrices

### P1 — Training CLI (Days 2-5)
- [ ] `splat_studio/pipeline/capture.py` — video → frames via ffmpeg
- [ ] `splat_studio/pipeline/colmap.py` — SfM wrapper; detect failures
- [ ] `splat_studio/pipeline/train.py` — gsplat training config
- [ ] `splat_studio/export/ksplat.py` — convert .ply → .ksplat (mkkellogg format)
- [ ] `splat_studio/export/compress.py` — quantization + SOGS optional
- [ ] Typer CLI: `splat-train --video X --output Y`
- [ ] Sample scene + small pytest (fixture: pre-cached COLMAP output)

### P2 — Viewer core (Days 6-8)
- [ ] Next.js 15 + React Three Fiber scaffold
- [ ] `<SplatScene />` component wrapping @mkkellogg/gaussian-splats-3d
- [ ] Camera controls (OrbitControls + fly mode)
- [ ] Loading progress (streaming .ksplat)
- [ ] Scene picker from JSON manifest

### P3 — UI polish (Days 9-10)
- [ ] Exposure + tone-mapping controls
- [ ] FOV slider
- [ ] Scene bookmarks (camera presets)
- [ ] Responsive mobile layout
- [ ] Screenshot / screen-record buttons

### P4 — Host + scenes (Day 11)
- [ ] Capture + train 5 scenes (indoor + outdoor)
- [ ] Upload to R2 or GH Release assets
- [ ] Update manifest
- [ ] Demo GIF

### P5 — Benchmarks + release (Day 12)
- [ ] PSNR/SSIM/LPIPS on Mip-NeRF-360 subset
- [ ] Training time + file size matrix
- [ ] `docs/BENCHMARKS.md` with honest numbers
- [ ] v1.0.0 release

## Acceptance
- ✅ `splat-train` produces a viewable scene end-to-end on one sample video
- ✅ Viewer loads 5 demo scenes smoothly on a modern laptop
- ✅ Mobile viewer works on an iPhone 13+
- ✅ Benchmarks table published
- ✅ Capture guide (`CAPTURE.md`) helps users avoid common failures
