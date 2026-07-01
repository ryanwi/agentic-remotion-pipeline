import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const paths = {
  root: ROOT,
  input: path.join(ROOT, "input"),
  render: path.join(ROOT, "render"),
  final: path.join(ROOT, "final"),
  public: path.join(ROOT, "public"),
  assets: path.join(ROOT, "assets"),
  plan: path.join(ROOT, "input", "plan.json"),
  props: path.join(ROOT, "render", "props.json"),
  audioPlan: path.join(ROOT, "render", "audio-plan.json"),
  silentRender: path.join(ROOT, "render", "out.mp4"),
};

/** Parse `--key=value` / `--flag` CLI args into a record. */
export const parseArgs = (argv = process.argv.slice(2)): Record<string, string | true> => {
  const out: Record<string, string | true> = {};
  for (const arg of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(arg);
    if (m) out[m[1]!] = m[2] ?? true;
  }
  return out;
};

const c = (code: string, s: string) => `\x1b[${code}m${s}\x1b[0m`;
export const log = {
  step: (s: string) => console.log(c("36", "▸ ") + s),
  ok: (s: string) => console.log(c("32", "✓ ") + s),
  warn: (s: string) => console.warn(c("33", "! ") + s),
  err: (s: string) => console.error(c("31", "✗ ") + s),
};

/** Run a binary, returning stdout. Throws on non-zero exit. */
export const run = (cmd: string, args: string[]): string =>
  execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** Duration of a media file in seconds via ffprobe. */
export const ffprobeDuration = (file: string): number => {
  const out = run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  const n = parseFloat(out.trim());
  if (!Number.isFinite(n)) throw new Error(`Could not read duration of ${file}`);
  return n;
};

export const secToFrames = (sec: number, fps: number): number => Math.max(1, Math.round(sec * fps));
