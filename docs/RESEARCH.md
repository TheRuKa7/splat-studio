# /ultraresearch — splat-studio

## 1. Gaussian Splatting — why it dominates

Pre-3DGS (2020-2022): NeRF (neural implicit) was king. Photoreal but slow to render (seconds per frame).

**3DGS** (Kerbl, Kopanas, Leimkühler, Drettakis — SIGGRAPH 2023): explicit 3D Gaussians + differentiable rasterizer. Real-time (>60fps), photoreal, trains in minutes.

Impact: flipped the field. Now all new research builds on 3DGS.

## 2. Variants

| Variant | Idea | When |
|---------|------|------|
| **3DGS** (original) | Anisotropic Gaussians | Default for general scenes |
| **2DGS** | 2D surface-aligned Gaussians | Smooth surfaces, better geometry |
| **SuGaR** | Surface-aligned + mesh extract | Need downstream mesh |
| **Mip-Splatting** | Anti-aliasing | Zoom-in quality |
| **Scaffold-GS** | Anchor-based, memory-efficient | Large scenes |
| **4DGS** | Time dimension | Dynamic scenes |
| **PhysGaussian** | Physics simulation | Research |
| **Gaussian Surfels** | Flat Gaussians | Thin structures |
| **FSGS** (Few-Shot GS) | Sparse views | < 10 images |

**Pick:** 3DGS primary; 2DGS opt-in for architectural/indoor.

## 3. Training libraries

| Lib | Pros | Cons |
|-----|------|------|
| **gsplat** (NVLabs) | Fast, maintained, cleaner API | Newer |
| Original 3DGS (Inria) | Reference impl | CUDA kernels brittle |
| **Nerfstudio** (KAIR Berkeley) | Unified pipeline, great UX | Python-heavy |
| SIBR viewer | Native tooling | Heavy install |

**Pick:** Nerfstudio + gsplat.

## 4. Photogrammetry preprocessing

- **COLMAP** — standard SfM, well-understood failure modes
- **HLOC** (hloc-superpoint) — better matching, slower
- **OpenSfM** — alternative
- **GLOMAP** — faster global SfM

**Pick:** COLMAP (stable, documented, baseline for comparisons).

## 5. Web viewers

| Project | Pros | Cons |
|---------|------|------|
| **@mkkellogg/gaussian-splats-3d** | Feature-rich Three.js integration | Heavier bundle |
| gsplat.js | Light, modern | Fewer features |
| antimatter15/splat | Elegant proof-of-concept | Minimal features |
| WebGPU splat (Luma, etc) | 2-3× faster | Chrome-only |

**Pick:** @mkkellogg/gaussian-splats-3d (production-ready) with WebGPU upgrade path.

## 6. File formats

| Format | Size | Compatibility |
|--------|------|---------------|
| `.ply` | Uncompressed, ~500MB-2GB | Native 3DGS output |
| `.splat` | ~50-200MB, quant | Web-friendly (antimatter15) |
| `.ksplat` | ~30-100MB | mkkellogg format |
| **SOGS** | ~20-50MB | Emerging, patent-pending? |

Target: `.ksplat` for viewer; keep `.ply` for archival.

## 7. Capture best practices

- Static scenes only (no moving objects)
- Cover 360° if possible; don't stand in one spot
- Maintain consistent lighting (no flash changes)
- 20-60 seconds of steady handheld video at 30fps → 600-1800 frames
- Sample every Nth frame to ~200-400 distinct views
- Well-textured scenes; COLMAP fails on blank walls

## 8. Benchmarks

| Metric | Target |
|--------|--------|
| PSNR | ≥ 28 dB on Mip-NeRF-360 |
| SSIM | ≥ 0.85 |
| LPIPS | ≤ 0.15 |
| Train time | < 30 min on RTX 3090 |
| Render FPS | ≥ 60 at 1080p |
| Compressed size | ≤ 100 MB |

## 9. Open questions

- [ ] Nerfstudio 2DGS stability as of shipping date?
- [ ] WebGPU viewer: ship gated behind `?gpu=1` flag?
- [ ] Scene auto-culling + LOD for huge scenes
- [ ] How to host .splat files without incurring R2 costs? (GH Releases has a 2GB limit but is free)
