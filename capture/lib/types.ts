import { z } from "zod";

export const StageSchema = z.enum([
  "queued",
  "preflight",
  "frames",
  "colmap:sparse",
  "colmap:bundle",
  "train",
  "densify",
  "export",
  "upload",
  "done",
  "failed",
]);
export type Stage = z.infer<typeof StageSchema>;

export const SceneSchema = z.object({
  id: z.string(),
  title: z.string(),
  captured_at: z.string(),
  duration_s: z.number(),
  resolution: z.string(), // "1920x1080"
  status: z.enum(["local", "uploading", "uploaded", "training", "ready", "failed"]),
  server_id: z.string().nullable().optional(),
  stage: StageSchema.nullable().optional(),
  progress: z.number().min(0).max(1).nullable().optional(),
  error_code: z.string().nullable().optional(),
  thumb_uri: z.string().nullable().optional(),
  local_uri: z.string().nullable().optional(),
});
export type Scene = z.infer<typeof SceneSchema>;

export const PreflightResultSchema = z.object({
  ok: z.boolean(),
  blur_score: z.number(),
  exposure_score: z.number(),
  overlap_score: z.number(),
  warnings: z.array(z.string()),
});
export type PreflightResult = z.infer<typeof PreflightResultSchema>;
