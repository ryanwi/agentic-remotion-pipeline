/**
 * mix.ts — the audio finisher.
 *
 * Composites an audio plan UNDER the silent Remotion render and normalizes the
 * result to a broadcast-style loudness target, then muxes without re-encoding
 * the video. This is deliberately separate from the composition: Remotion
 * renders picture only; all audio lands here.
 *
 *   render/out.mp4  (silent)  +  render/audio-plan.json
 *        │  narration segments: -ss/-t slice → adelay → volume
 *        │  music bed: loop → volume → trim to length
 *        │  amix → premaster.wav
 *        │  two-pass loudnorm (measure, then linear correction)
 *        ▼
 *   final/out.mp4  (−14 LUFS, AAC 320k, +faststart)
 *
 * With no audio plan it copies the silent render through so `npm run all`
 * always yields final/out.mp4.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { paths, log, ffprobeDuration } from "./lib.ts";
import { AudioPlanSchema, type AudioPlan } from "./input-schema.ts";

const ffmpeg = (args: string[]): string =>
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

const resolveAsset = (src: string): string => {
  if (path.isAbsolute(src) && fs.existsSync(src)) return src;
  for (const base of [paths.assets, paths.public, paths.root]) {
    const p = path.join(base, src);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Audio asset not found: ${src} (looked in assets/, public/, repo root)`);
};

if (!fs.existsSync(paths.silentRender)) {
  log.err(
    `No render at ${path.relative(paths.root, paths.silentRender)}. Run \`npm run render\` first.`,
  );
  process.exit(1);
}

fs.mkdirSync(paths.final, { recursive: true });
const finalOut = path.join(paths.final, "out.mp4");
const videoDur = ffprobeDuration(paths.silentRender);

// No audio plan → pass the silent video through (with faststart) and stop.
if (!fs.existsSync(paths.audioPlan)) {
  log.warn("No render/audio-plan.json — muxing silent video through to final/out.mp4.");
  ffmpeg(["-i", paths.silentRender, "-c", "copy", "-movflags", "+faststart", finalOut]);
  log.ok(`final/out.mp4 (${videoDur.toFixed(1)}s, silent)`);
  process.exit(0);
}

const audio: AudioPlan = AudioPlanSchema.parse(
  JSON.parse(fs.readFileSync(paths.audioPlan, "utf8")),
);

if (!audio.narration.length && !audio.music) {
  log.warn("Audio plan has no narration or music — muxing silent video through.");
  ffmpeg(["-i", paths.silentRender, "-c", "copy", "-movflags", "+faststart", finalOut]);
  log.ok(`final/out.mp4 (${videoDur.toFixed(1)}s, silent)`);
  process.exit(0);
}

// ---- Pass 1: build the premaster mix ---------------------------------------
const premaster = path.join(paths.render, "mix-premaster.wav");
const inputArgs: string[] = [];
const filters: string[] = [];
const mixLabels: string[] = [];
let idx = 0;

for (const seg of audio.narration) {
  inputArgs.push(
    "-ss",
    String(seg.inpointSec),
    "-t",
    String(seg.durationSec),
    "-i",
    resolveAsset(seg.src),
  );
  const delayMs = Math.round(seg.timelineStartSec * 1000);
  filters.push(`[${idx}:a]aresample=48000,volume=${seg.gainDb}dB,adelay=${delayMs}:all=1[n${idx}]`);
  mixLabels.push(`[n${idx}]`);
  idx++;
}

if (audio.music) {
  inputArgs.push("-stream_loop", "-1", "-i", resolveAsset(audio.music.src));
  filters.push(
    `[${idx}:a]aresample=48000,volume=${audio.music.gainDb}dB,atrim=end=${videoDur.toFixed(3)},asetpts=PTS-STARTPTS[music]`,
  );
  mixLabels.push("[music]");
  idx++;
}

const mixFilter =
  mixLabels.length > 1
    ? `${mixLabels.join("")}amix=inputs=${mixLabels.length}:normalize=0:dropout_transition=0[mix]`
    : `${mixLabels[0]}anull[mix]`;

log.step(`Mixing ${audio.narration.length} narration seg(s)${audio.music ? " + music" : ""}…`);
ffmpeg([
  ...inputArgs,
  "-filter_complex",
  [...filters, mixFilter].join(";"),
  "-map",
  "[mix]",
  "-t",
  videoDur.toFixed(3),
  "-ar",
  "48000",
  premaster,
]);

// ---- Pass 2: measure loudness, then apply a linear correction --------------
const target = audio.targetLufs;
// loudnorm prints its measurement JSON to STDERR, so capture stderr specifically.
const measure = spawnSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-i",
    premaster,
    "-af",
    `loudnorm=I=${target}:TP=-1.5:LRA=11:print_format=json`,
    "-f",
    "null",
    "-",
  ],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
const measureOut = measure.stderr ?? "";
const jsonMatch = measureOut.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  log.err("Could not read loudnorm measurement from ffmpeg:");
  console.error(measureOut.slice(-800));
  process.exit(1);
}
const measured = JSON.parse(jsonMatch[0]);

// Linear correction needs finite measured values. A silent/near-silent premaster
// measures as -inf integrated loudness (below the gate), which the linear pass
// can't consume — fall back to single-pass dynamic loudnorm, which never errors.
const finite = [measured.input_i, measured.input_tp, measured.target_offset].every((v) =>
  Number.isFinite(parseFloat(v)),
);
const loudnorm = finite
  ? `loudnorm=I=${target}:TP=-1.5:LRA=11:` +
    `measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:` +
    `measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:` +
    `offset=${measured.target_offset}:linear=true`
  : `loudnorm=I=${target}:TP=-1.5:LRA=11`;
if (!finite) {
  log.warn("Premaster too quiet to measure; using dynamic loudnorm.");
}

log.step(`Normalizing to ${target} LUFS and muxing…`);
ffmpeg([
  "-i",
  paths.silentRender,
  "-i",
  premaster,
  "-filter_complex",
  `[1:a]${loudnorm}[a]`,
  "-map",
  "0:v",
  "-map",
  "[a]",
  "-c:v",
  "copy",
  "-c:a",
  "aac",
  "-b:a",
  "320k",
  "-movflags",
  "+faststart",
  finalOut,
]);

log.ok(`final/out.mp4 (${videoDur.toFixed(1)}s, ${target} LUFS)`);
