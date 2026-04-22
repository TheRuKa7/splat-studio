# /ultrathink — splat-studio

## 1. Why spatial AI in this portfolio?

Two reasons:
1. **Current** — Gaussian Splatting is the 2024-2026 breakthrough. Shows Rushil tracks frontier, not legacy.
2. **Scarce** — most AI engineers don't touch 3D. Portfolio gap that's hard to fake.

## 2. Why ship the pipeline, not just a viewer?

Most splat demos are "look at this pretty scene." They're bakeware.

Shipping the pipeline proves:
- You understand SfM (most ML folks don't)
- You understand GPU training economics
- You understand the full path to production (capture → train → compress → stream)
- You can debug pipeline failures (COLMAP is notoriously finicky)

## 3. Why React Three Fiber over vanilla Three.js?

- **React model** — state integration trivial
- **Declarative** — scenes as components, not imperative setup
- **Ecosystem** — drei utilities, React ecosystem benefits
- **Talent pool** — recruiters recognize the stack quicker

Tradeoff: abstraction cost. Worth it.

## 4. Why not WebGPU primary?

WebGPU gives 2-3× render speedup but is Chrome-only on stable builds (as of 2024-2025; likely broader by 2026 — verify). Portfolio viewers must work everywhere. WebGL first, WebGPU as opt-in.

## 5. The GPU economics problem

Training needs a GPU. Recruiters don't have GPUs.

Mitigations:
- Pre-train 5 scenes; ship `.ksplat` files via R2/GH Releases (not git — too big)
- Viewer runs on any laptop/phone (WebGL)
- Training CLI documented but "optional"
- Fallback: colab notebook for "train your own scene" with free T4 time

## 6. Unique capture guide

COLMAP failure modes are under-documented. Shipping `CAPTURE.md` with:
- Which scenes work / don't (texture, lighting, motion)
- How to hold camera (speed, coverage, overlap)
- Preflight script that estimates likely success
... is a meaningful user-facing artifact. Rare in this space.

## 7. PM framing (for interviews)

- **Problem:** current 3D capture is expensive (DSLRs, scanners, Matterport) and results are clunky
- **Insight:** 3DGS makes photo-quality 3D capture accessible — just a phone video
- **Users:** realtors (walkthroughs), museums (heritage), DP/VFX (previs), product catalog teams
- **Wedge:** real-time web rendering, no app install
- **Monetization:** per-scene hosted pricing; enterprise on-prem training
- **Competition:** Luma AI, Polycam, Scaniverse — we'd target API/pipeline quality over consumer polish

## 8. Tradeoffs

| Decision | Alt | Why |
|----------|-----|-----|
| 3DGS over NeRF | Instant-NGP | Current SOTA + real-time web |
| gsplat over original | Inria 3DGS | Cleaner, maintained |
| Nerfstudio over raw gsplat | Training loop from scratch | Battle-tested UX |
| COLMAP over GLOMAP | | Stable, documented, baseline |
| .ksplat over .splat | `.splat` (antimatter15) | Smaller, streaming-friendly |
| mkkellogg viewer | gsplat.js | More features, better mobile |

## 9. Risks

| Risk | Mitigation |
|------|------------|
| COLMAP fails on low-texture | Preflight script + doc failure modes |
| Scene files too big to host | R2/GH Releases + manifest-driven loading |
| Viewer janky on mobile | Early mobile testing; LOD |
| CUDA setup pain on Windows | WSL2 documentation; Linux-first |
| WebGPU inconsistency | Gate behind flag; WebGL default |
| Training cost at scale | Document "free Colab" path; don't make it the primary demo |

## 10. What v2 brings

- 2DGS + SuGaR for mesh extraction
- Dynamic scenes (4DGS)
- In-browser WebGPU training (experimental)
- Scene editor (remove objects, repaint)
- VR mode via WebXR

## 11. Interview talking points

- *"Why 3DGS over NeRF?"* — real-time rendering, faster training, explicit representation
- *"How does 3DGS work?"* — explicit 3D Gaussians rasterized differentiably; optimized via L1 + SSIM loss on training views
- *"Why is COLMAP needed?"* — bootstraps camera poses + sparse 3D points; all 3DGS implementations need initial pose estimates
- *"How do you compress scenes?"* — quantization (float32 → int8) + SOGS entropy coding; 5-10× reduction
- *"Mobile performance strategy?"* — LOD + view culling + resolution-scale on capability detection
