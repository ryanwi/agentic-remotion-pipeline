/**
 * build-props.ts — compile the human-authored input plan into render props.
 *
 *   input/plan.json  (seconds, ergonomic)
 *        │  validate → accumulate startFrames → seconds→frames
 *        ▼
 *   render/props.json      (frames; the composition's only input)
 *   render/audio-plan.json (seconds; consumed by mix.ts, if any audio)
 *
 * Never hand-edit the generated files — re-run this instead.
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs, paths, log, secToFrames } from "./lib.ts";
import { InputPlanSchema, type InputScene } from "./input-schema.ts";
import { VideoPlanSchema, type Scene, type CaptionWord } from "../remotion/src/schema.ts";

const args = parseArgs();
const planPath = typeof args.plan === "string" ? path.resolve(args.plan) : paths.plan;

if (!fs.existsSync(planPath)) {
  log.err(`No input plan at ${planPath}. Create input/plan.json (see README).`);
  process.exit(1);
}

log.step(`Reading ${path.relative(paths.root, planPath)}`);
const raw = JSON.parse(fs.readFileSync(planPath, "utf8"));
const parsed = InputPlanSchema.safeParse(raw);
if (!parsed.success) {
  log.err("input/plan.json failed validation:");
  console.error(parsed.error.format());
  process.exit(1);
}
const plan = parsed.data;
const { fps } = plan.meta;

// Accumulate scene start frames on a running cursor.
let cursor = 0;
const scenes: Scene[] = plan.scenes.map((s: InputScene) => {
  const durationFrames = secToFrames(s.durationSec, fps);
  const startFrame = cursor;
  cursor += durationFrames;
  const common = { startFrame, durationFrames };

  switch (s.type) {
    case "title":
      return { ...common, type: "title", title: s.title, subtitle: s.subtitle };
    case "quote":
      return { ...common, type: "quote", quote: s.quote, attribution: s.attribution };
    case "stat":
      return { ...common, type: "stat", value: s.value, label: s.label };
    case "image":
      return {
        ...common,
        type: "image",
        src: s.src,
        caption: s.caption,
        source: s.source,
        kenBurns: s.kenBurns
          ? { fromScale: 1, toScale: 1.12, fromX: 0, toX: 0, fromY: 0, toY: 0, ...s.kenBurns }
          : undefined,
      };
    case "video":
      return {
        ...common,
        type: "video",
        src: s.src,
        trimStartSec: s.trimStartSec,
        playbackRate: s.playbackRate,
        callouts: s.callouts.map((c) => ({
          text: c.text,
          body: c.body,
          from: c.from,
          atFrame: secToFrames(c.atSec, fps) - 1,
          durationFrames: secToFrames(c.durationSec, fps),
        })),
      };
    case "end":
      return { ...common, type: "end", title: s.title, tagline: s.tagline };
  }
});

const totalFrames = cursor;

const captions: CaptionWord[] = plan.captions.map((w) => ({
  text: w.text,
  startFrame: secToFrames(w.startSec, fps) - 1,
  endFrame: secToFrames(w.endSec, fps) - 1,
}));

const videoPlan = VideoPlanSchema.parse({
  fps,
  width: plan.meta.width,
  height: plan.meta.height,
  totalFrames,
  scenes,
  captions,
});

fs.mkdirSync(paths.render, { recursive: true });
fs.writeFileSync(paths.props, JSON.stringify(videoPlan, null, 2));
log.ok(
  `render/props.json — ${scenes.length} scenes, ${totalFrames} frames (${(totalFrames / fps).toFixed(1)}s @ ${fps}fps)`,
);

// Emit the audio plan separately (seconds-based) for mix.ts.
if (plan.audio) {
  fs.writeFileSync(paths.audioPlan, JSON.stringify(plan.audio, null, 2));
  log.ok(
    `render/audio-plan.json — ${plan.audio.narration.length} narration seg(s)${plan.audio.music ? " + music bed" : ""}`,
  );
} else if (fs.existsSync(paths.audioPlan)) {
  fs.rmSync(paths.audioPlan);
}
