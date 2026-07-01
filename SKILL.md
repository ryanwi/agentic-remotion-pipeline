---
name: agentic-remotion-pipeline
description: Drive a JSON-in / video-out Remotion project. Use when producing a video from structured data in this repo (or one scaffolded from it) — authoring input/plan.json, running build-props → render → mix, and extending scenes. For how to write Remotion code itself, defer to the official remotion-dev/skills.
metadata:
  tags: remotion, video, pipeline, ffmpeg, loudnorm, agent
---

## When to use

Use this when working in a project built on the `agentic-remotion-pipeline` scaffold — i.e. one with
`input/plan.json`, `scripts/build-props.ts`, `scripts/mix.ts`, and a single data-driven Remotion
composition. It covers producing a video and extending the pipeline, **not** general Remotion
authoring — for animation/sequencing/effects/fonts, load the official
[`remotion-dev/skills`](https://github.com/remotion-dev/skills) skill instead.

## Mental model

One composition renders whatever a frame-based `VideoPlan` describes. A human/LLM authors a
seconds-based `input/plan.json`; `build-props.ts` compiles it to `render/props.json`. Remotion
renders **silent** picture; `mix.ts` adds audio and normalizes loudness. You edit the plan and the
code — never the generated `render/*` files.

```
input/plan.json → build:props → render (silent) → mix (audio, −14 LUFS) → final/out.mp4
```

## Producing a video

1. Edit `input/plan.json` (see `scripts/input-schema.ts` for the exact shape). Scenes:
   `title | quote | stat | image | video | end`, each with `durationSec`. Optional `captions`
   (karaoke word timings) and `audio` (music bed + narration segments).
2. Localize any remote images/audio into `public/` or `assets/` first — never hotlink.
3. `npm run all` (build-props → render → mix). Use `npm run preview` for Studio, `npm run still`
   for a fast single-frame check.
4. `npm run doctor` before handing back.

## Rules (see CLAUDE.md for the full contract)

- Never hand-edit `render/props.json` / `render/audio-plan.json` — regenerate via `build:props`.
- Duration/dimensions come from the plan via `calculateMetadata`; never hardcode a frame count.
- Audio lives in `mix.ts` and the plan's `audio` block, never in the composition.
- Use `<Img>` / `<OffthreadVideo>`, never bare `<img>`/`<video>`.

## Adding a scene type

Extend, in order: `scripts/input-schema.ts` → `remotion/src/schema.ts` → the `switch` in
`scripts/build-props.ts` → a component + `case` in `remotion/src/compositions/VideoFromPlan.tsx`.
Re-skinning is `remotion/src/theme.ts` only.

## Reusable pieces worth copying out

- `scripts/mix.ts` — composite an audio plan under a silent render + two-pass linear loudnorm + mux.
- `remotion/src/components/` — `ZoomPan` (Ken Burns), `Callout` (lower-third), `Captions` (karaoke),
  `TitleCard`/`EndCard`/`QuoteScene`/`StatScene`/`ImageScene`.
- `bin/doctor` — environment + code-quality preflight.
