# STATE

Living operational doc. Keep it short; update it when the pipeline shape changes.

## What this is

A public, reusable Remotion **production harness** — JSON in, loudness-normalized MP4 out. Extracted
from the common skeleton of several agent-driven video pipelines. It is the layer *above*
`remotion-dev/skills` (which teaches authoring); this teaches the repeatable project shape.

## Status

- v0.1 scaffold. Pipeline verified end to end: `build:props` → `render` → `mix` → `final/out.mp4`.
- Demo plan renders a ~15s vertical explainer with zero external assets.
- `mix.ts` loudnorm verified (a −30 dB tone comes out at −14.05 LUFS).

## Verified

- `npm run all` produces `final/out.mp4` (1080×1920 h264, 15.06s).
- `npm run still` renders a correct frame (title card + karaoke caption highlight).
- `npm run typecheck` clean.

## Known gaps / intentional omissions

- No transcript→caption auto-gen, audio-viz, TTS, audio↔video anchor sync, or cloud rendering.
  These are documented in `docs/agent-guide.md` as extension points, not shipped.
- Demo has no audio asset, so `npm run all` produces a silent final by design (add an `audio` block).

## Ideas / backlog

- `scripts/mix.ts` is the canonical home for the audio-composite + loudnorm logic. (Considered
  extracting it as a standalone `remotion-audio-mux` package — decided against: it's a thin ffmpeg
  wrapper with a near-zero audience, not worth the maintenance. Lift the file into new repos as needed.)
