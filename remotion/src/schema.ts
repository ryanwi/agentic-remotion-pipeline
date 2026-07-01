import { z } from "zod";

/**
 * The render-props contract ("props-as-timeline").
 *
 * This is the SINGLE source of truth for what the composition renders. It is
 * always FRAME-based (never seconds) and is generated fresh by
 * `scripts/build-props.ts` into `render/props.json`. Never hand-edit that file.
 *
 * A human authors `input/plan.json` (seconds-based, see scripts/input-schema.ts);
 * build-props converts it to this.
 */

export const KenBurnsSchema = z.object({
  fromScale: z.number().default(1),
  toScale: z.number().default(1.12),
  fromX: z.number().default(0),
  toX: z.number().default(0),
  fromY: z.number().default(0),
  toY: z.number().default(0),
});
export type KenBurns = z.infer<typeof KenBurnsSchema>;

export const CalloutSchema = z.object({
  text: z.string(),
  body: z.string().optional(),
  from: z.enum(["left", "right", "bottom"]).default("bottom"),
  /** Frame (relative to the scene) at which the callout appears. */
  atFrame: z.number().int().nonnegative().default(0),
  durationFrames: z.number().int().positive(),
});
export type Callout = z.infer<typeof CalloutSchema>;

const BaseScene = {
  startFrame: z.number().int().nonnegative(),
  durationFrames: z.number().int().positive(),
};

export const SceneSchema = z.discriminatedUnion("type", [
  z.object({
    ...BaseScene,
    type: z.literal("title"),
    title: z.string(),
    subtitle: z.string().optional(),
  }),
  z.object({
    ...BaseScene,
    type: z.literal("quote"),
    quote: z.string(),
    attribution: z.string().optional(),
  }),
  z.object({
    ...BaseScene,
    type: z.literal("stat"),
    value: z.string(),
    label: z.string(),
  }),
  z.object({
    ...BaseScene,
    type: z.literal("image"),
    /** Path relative to public/, resolved via staticFile(). Localize remote URLs at build time. */
    src: z.string(),
    caption: z.string().optional(),
    source: z.string().optional(),
    kenBurns: KenBurnsSchema.optional(),
  }),
  z.object({
    ...BaseScene,
    type: z.literal("video"),
    /** Path relative to public/, resolved via staticFile(). */
    src: z.string(),
    trimStartSec: z.number().nonnegative().default(0),
    playbackRate: z.number().positive().default(1),
    callouts: z.array(CalloutSchema).default([]),
  }),
  z.object({
    ...BaseScene,
    type: z.literal("end"),
    title: z.string(),
    tagline: z.string().optional(),
  }),
]);
export type Scene = z.infer<typeof SceneSchema>;

/** A word-timed caption token for the karaoke overlay. */
export const CaptionWordSchema = z.object({
  text: z.string(),
  startFrame: z.number().int().nonnegative(),
  endFrame: z.number().int().nonnegative(),
});
export type CaptionWord = z.infer<typeof CaptionWordSchema>;

export const VideoPlanSchema = z.object({
  fps: z.number().int().positive().default(30),
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  totalFrames: z.number().int().positive(),
  scenes: z.array(SceneSchema),
  /** Optional karaoke caption overlay spanning the whole timeline. */
  captions: z.array(CaptionWordSchema).default([]),
});
export type VideoPlan = z.infer<typeof VideoPlanSchema>;
