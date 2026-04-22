# Capture Guide — splat-studio

The 80/20 of successful scene capture. Read this before training your first scene.

## What works

- **Static scenes** — no moving people/pets/curtains
- **Well-textured surfaces** — books, plants, varied objects
- **Consistent lighting** — no flash, no auto-exposure jumps
- **360° coverage** — walk around, cover every angle
- **Slow, steady motion** — no motion blur
- **20-60 seconds** at 30fps (600-1800 frames; we'll sample 200-400)

## What fails

- Large blank walls (COLMAP can't match features)
- Mirrors, glass, reflective surfaces (confuses matching)
- Fast camera motion (motion blur kills features)
- Changing lighting (COLMAP assumes fixed)
- Single-side coverage (no depth signal)
- Small screens (TV, monitor) showing moving content

## Preflight checklist

```bash
# Run before committing to a long training job
splat-studio preflight --video kitchen.mp4
```

Reports:
- Frame count
- Motion-blur estimate
- Feature density (COLMAP dry-run on 10% of frames)
- Estimated COLMAP success probability

If probability < 60%, consider re-capturing.

## Recommended capture pattern

1. Stand at scene edge; start recording
2. Walk slowly clockwise around the subject
3. Vary height: waist, eye level, overhead
4. Don't zoom
5. Overlap viewing angles (each spot visible from 3+ frames)
6. End where you started to close the loop

## Failure recovery

If COLMAP fails:
1. Check the preflight output
2. Try HLOC instead (`--sfm hloc`)
3. Increase frame sampling density (`--sample-every 1`)
4. Manually exclude bad frames
5. Re-capture (often fastest)
