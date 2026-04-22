# DFD — splat-studio

## Level 0 — Context

```mermaid
flowchart LR
  U[User<br/>phone / DSLR / drone]
  TR((training/<br/>Python + GPU))
  VW((viewer/<br/>Next.js static))
  CDN[CDN / object store<br/>R2 / S3]
  WB[W&B]
  BR[Browser / mobile]

  U -- video or photos --> TR
  TR -- .ksplat / .ply --> CDN
  TR -- curves, metrics --> WB
  TR -- scenes.json PR --> VW
  CDN -- splat bytes --> BR
  VW -- static bundle --> BR
```

## Level 1 — Training pipeline

```mermaid
flowchart TD
  subgraph Preflight
    PF[1.0 Preflight<br/>blur / exposure / overlap]
  end

  subgraph Frames
    FR[2.0 Frame extractor<br/>ffmpeg sample]
  end

  subgraph COLMAP
    CS[3.0 COLMAP sparse<br/>feature + match]
    CB[3.1 Bundle adjust]
    PCD[3.2 Init pointcloud]
  end

  subgraph Train
    GS[4.0 gsplat train<br/>3DGS / 2DGS]
    DEN[4.1 Density control]
    CHK[4.2 Checkpoints]
  end

  subgraph Export
    EX[5.0 Converter<br/>ply / ksplat / splat]
    THM[5.1 Thumbnail]
  end

  subgraph Observe
    WB[wandb]
    MF[manifest.json]
  end

  PF --> FR --> CS --> CB --> PCD --> GS
  GS <--> DEN
  GS --> CHK
  GS --> WB
  GS --> EX --> THM
  GS --> MF
```

## Level 1 — Viewer

```mermaid
flowchart TD
  BLD[viewer/ build<br/>Next.js 15]
  MAN[scenes.json + scenes.schema.json]
  STATIC[Static bundle]
  REN[Renderer<br/>mkkellogg/gaussian-splats-3d]
  CDN[(CDN / R2)]
  BR[Browser]

  MAN -- validated by ajv --> BLD
  BLD --> STATIC
  BR -- load --> STATIC
  STATIC --> REN
  REN -- fetch splat --> CDN
  CDN --> REN
```

## Level 2 — Phone clip → viewer URL (happy path)

```mermaid
sequenceDiagram
  autonumber
  participant U as User CLI
  participant P as Preflight
  participant F as Frames
  participant C as COLMAP
  participant G as gsplat
  participant E as Export
  participant O as Object store
  participant V as Viewer manifest PR
  U->>P: splat-studio train --video liv.mp4 --scene liv-01
  P-->>U: ok (blur, exposure, overlap)
  P->>F: sample frames
  F->>C: call COLMAP subprocess
  C-->>F: cameras.bin / images.bin / points3D.bin
  F->>G: init pointcloud + poses
  loop 20k iters
    G->>G: forward + loss + densify
    G->>O: checkpoint every N iters
    G->>W&B: log
  end
  G->>E: convert to ksplat
  E->>O: upload liv-01.ksplat + thumb.jpg
  E->>V: open PR adding scene to scenes.json
  V-->>U: PR URL
```

## Level 2 — COLMAP failure path

```mermaid
sequenceDiagram
  autonumber
  participant P as Pipeline
  participant C as COLMAP subprocess
  participant S as Stage parser
  participant U as User CLI
  P->>C: spawn
  C-->>P: stdout lines (parsed by S)
  S->>P: event (stage=colmap:sparse, progress)
  Note over C: feature matching fails
  C-->>P: non-zero exit
  P->>S: classify error -> "insufficient_overlap"
  S->>P: StageResult(status=failed, error_code, docs_link)
  P-->>U: structured error + hint + partial artefacts path
```

## Data stores

| Store | Purpose | Retention |
|-------|---------|-----------|
| `training/runs/{scene}/` | Per-scene artefacts, manifest, checkpoints | Until manually purged |
| `wandb` | Training curves, videos | Managed |
| Object store `scenes/*.ksplat` | Scene splats | User-controlled |
| `viewer/src/components/scenes.json` | Scene catalog committed to repo | Git |

## Trust boundaries

```mermaid
flowchart LR
  subgraph Capture["Capture device"]
    PHONE
    DSLR
  end
  subgraph TRAIN["GPU host"]
    PIPE[training/]
    COLMAP[(COLMAP subprocess)]
  end
  subgraph STORE["Object store / CDN"]
    R2[(R2 / S3)]
  end
  subgraph EDGE["Static edge"]
    VUI[viewer/]
  end
  subgraph User
    BR[Browser]
  end
  PHONE --> PIPE
  DSLR --> PIPE
  PIPE <--> COLMAP
  PIPE --> R2
  VUI --> R2
  BR --> VUI
  BR --> R2
```

## Invariants

- COLMAP is always invoked as subprocess; failures map to one of a closed set of
  error codes referenced in `CAPTURE.md`.
- Every scene in `scenes.json` MUST pass `ajv` validation at build time.
- Training checkpoints every N iters allow `--resume` without re-running COLMAP.
- Scene URLs in the manifest must use HTTPS (CI check).
- License field per scene in the manifest is mandatory (CC-BY, CC0, proprietary).
