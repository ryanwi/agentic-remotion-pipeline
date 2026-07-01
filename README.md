# agentic-remotion-pipeline

An opinionated, **agent-drivable** [Remotion](https://www.remotion.dev) scaffold: put a
structured JSON plan in, get a finished, loudness-normalized MP4 out. No timeline scrubbing, no
hand-tuned frames — a person (or an LLM) edits one JSON file and runs one command.

```
input/plan.json ──▶ build-props ──▶ remotion render ──▶ mix ──▶ final/out.mp4
   (you edit)        render/props.json   (silent MP4)    (+audio, −14 LUFS)
```

This is **not** a Remotion tutorial or a component library — Remotion's official
[`remotion-dev/skills`](https://github.com/remotion-dev/skills) already teaches an agent how to
write compositions, captions, transitions, audio-viz, and voiceover. This repo is the layer above
that: a repeatable **production harness** so an agent can go from data to deliverable unattended.

## Quick start

```bash
npm install
npm run all      # build props → render → mix → final/out.mp4
npm run preview  # or open Remotion Studio to iterate visually
```

`npm run all` renders the demo plan (a ~15s vertical explainer) with zero external assets.

## The workflow

You touch exactly **one** file: `input/plan.json`. Everything else is generated.

1. **Author the plan** — a seconds-based list of scenes (`title`, `quote`, `stat`, `image`,
   `video`, `end`), an optional karaoke `captions` array, and an optional `audio` block. Validated
   by a Zod schema (`scripts/input-schema.ts`), so bad input fails loudly.
2. **`npm run build:props`** — compiles the plan into `render/props.json` (frame-based; the
   composition's only input) and `render/audio-plan.json` (if you specified audio).
3. **`npm run render`** — renders a **silent** MP4 via the Remotion CLI. Duration and dimensions
   come from the props, not from hardcoded composition config.
4. **`npm run mix`** — composites the audio plan under the video, normalizes to −14 LUFS with a
   two-pass loudnorm, and muxes without re-encoding the picture → `final/out.mp4`.

## Adding audio

Audio is added **after** rendering (mix.ts), never inside the composition. Drop a file in
`assets/` and add an `audio` block to your plan:

```jsonc
{
  "scenes": [ /* ... */ ],
  "audio": {
    "targetLufs": -14,
    "music": { "src": "music/bed.mp3", "gainDb": -20 },
    "narration": [
      { "src": "vo/intro.mp3", "timelineStartSec": 0, "durationSec": 6 }
    ]
  }
}
```

`src` is resolved against `assets/`, then `public/`, then the repo root. Without an `audio` block,
`mix` passes the silent render straight through so `final/out.mp4` always exists.

## Adding images / video

Put assets under `public/` and reference them by path (`Img`/`OffthreadVideo` resolve via
`staticFile`). For remote images, download them locally at build time first — never hotlink, or a
blocking CDN will stall the headless render. See `docs/agent-guide.md`.

## Layout

```
input/plan.json            # the one file you edit (or an agent generates)
remotion/src/
  Root.tsx                 # single composition; duration/size from props (calculateMetadata)
  schema.ts                # render-props contract (frame-based, Zod)
  theme.ts                 # the brand-swap surface (tokens + Google fonts)
  compositions/VideoFromPlan.tsx   # maps scenes → <Sequence>s
  components/              # Callout, ZoomPan (Ken Burns), Captions, Title/End/Quote/Stat/Image, FootageShot
scripts/
  input-schema.ts          # human-authored plan contract (seconds-based, Zod)
  build-props.ts           # plan → render/props.json (+ audio-plan.json)
  mix.ts                   # audio composite + two-pass loudnorm + mux  ← the reusable crown jewel
  lib.ts                   # paths, arg parsing, ffprobe helpers
bin/doctor                 # environment + code-quality preflight
final/out.mp4              # the deliverable (gitignored)
```

## Requirements

Node ≥ 18 and `ffmpeg`/`ffprobe` on your PATH. Run `npm run doctor` to verify.

## Use as an agent skill

Beyond scaffolding a project, this repo ships a skill (`SKILL.md`) so an agent knows how to *drive*
a pipeline built from it. Install it into Claude Code:

```bash
# Claude Code plugin marketplace
/plugin marketplace add ryanwi/agentic-remotion-pipeline
/plugin install agentic-remotion-pipeline@agentic-remotion

# or via skills.sh
npx skills add ryanwi/agentic-remotion-pipeline
```

The skill covers producing a video and extending the pipeline; for Remotion authoring itself it
defers to the official [`remotion-dev/skills`](https://github.com/remotion-dev/skills).

## Why it's structured this way

See [`docs/agent-guide.md`](docs/agent-guide.md) for the conventions and the reasoning behind them
(the props-as-timeline contract, why audio is post-render, the bounded-wait / local-asset rules).

## License

MIT
