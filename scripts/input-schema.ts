import { z } from "zod";
import { KenBurnsSchema } from "../remotion/src/schema";

/**
 * The HUMAN-authored input contract: `input/plan.json`.
 *
 * This is seconds-based and ergonomic to write (or generate with an LLM).
 * `scripts/build-props.ts` compiles it into the frame-based render props.
 * You edit THIS file; you never edit `render/props.json`.
 */

const InputCallout = z.object({
  text: z.string(),
  body: z.string().optional(),
  from: z.enum(["left", "right", "bottom"]).default("bottom"),
  atSec: z.number().nonnegative().default(0),
  durationSec: z.number().positive(),
});

const base = { durationSec: z.number().positive() };

export const InputSceneSchema = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("title"),
    title: z.string(),
    subtitle: z.string().optional(),
  }),
  z.object({
    ...base,
    type: z.literal("quote"),
    quote: z.string(),
    attribution: z.string().optional(),
  }),
  z.object({ ...base, type: z.literal("stat"), value: z.string(), label: z.string() }),
  z.object({
    ...base,
    type: z.literal("image"),
    src: z.string(),
    caption: z.string().optional(),
    source: z.string().optional(),
    kenBurns: KenBurnsSchema.partial().optional(),
  }),
  z.object({
    ...base,
    type: z.literal("video"),
    src: z.string(),
    trimStartSec: z.number().nonnegative().default(0),
    playbackRate: z.number().positive().default(1),
    callouts: z.array(InputCallout).default([]),
  }),
  z.object({ ...base, type: z.literal("end"), title: z.string(), tagline: z.string().optional() }),
]);
export type InputScene = z.infer<typeof InputSceneSchema>;

export const InputCaptionSchema = z.object({
  text: z.string(),
  startSec: z.number().nonnegative(),
  endSec: z.number().nonnegative(),
});

/** Audio is composited by mix.ts AFTER rendering, never inside the composition. */
export const AudioPlanSchema = z.object({
  targetLufs: z.number().default(-14),
  music: z.object({ src: z.string(), gainDb: z.number().default(-20) }).optional(),
  narration: z
    .array(
      z.object({
        src: z.string(),
        inpointSec: z.number().nonnegative().default(0),
        timelineStartSec: z.number().nonnegative(),
        durationSec: z.number().positive(),
        gainDb: z.number().default(0),
      }),
    )
    .default([]),
});
export type AudioPlan = z.infer<typeof AudioPlanSchema>;

export const InputPlanSchema = z.object({
  meta: z
    .object({
      fps: z.number().int().positive().default(30),
      width: z.number().int().positive().default(1080),
      height: z.number().int().positive().default(1920),
    })
    .default({ fps: 30, width: 1080, height: 1920 }),
  scenes: z.array(InputSceneSchema).min(1),
  captions: z.array(InputCaptionSchema).default([]),
  audio: AudioPlanSchema.optional(),
});
export type InputPlan = z.infer<typeof InputPlanSchema>;
