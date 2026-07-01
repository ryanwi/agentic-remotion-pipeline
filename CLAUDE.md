# CLAUDE.md — agent contract

This repo turns a JSON plan into a finished video. You (the agent) drive it by editing **one**
file and running the pipeline. Follow these rules exactly.

## The one file you edit

`input/plan.json` — a seconds-based scene list validated by `scripts/input-schema.ts`. Everything
in `render/` and `final/` is **generated**. Read the schema before editing so you emit valid input.

## The pipeline

```
input/plan.json → npm run build:props → npm run render → npm run mix → final/out.mp4
```

`npm run all` = render + mix. `npm run preview` opens Remotion Studio for visual iteration.

## Non-negotiable rules

1. **Never hand-edit `render/props.json` or `render/audio-plan.json`.** They are compiled from
   `input/plan.json` by `build:props`. If the output is wrong, fix the plan or `build-props.ts`,
   then regenerate.
2. **Duration and dimensions are data-driven.** They come from the plan via `calculateMetadata` in
   `Root.tsx`. Never hardcode a frame count or a scene count.
3. **Audio is added after rendering, in `mix.ts` — never inside the composition.** The composition
   renders silent picture only. Narration/music/loudness all live in the `audio` block of the plan.
4. **Always use Remotion's `<Img>` / `<OffthreadVideo>`, never a bare `<img>`/`<video>`.** Bare tags
   don't register with `delayRender`, so a frame can be captured before a large asset decodes.
5. **Localize remote assets before rendering — never hotlink.** A blocking CDN will stall the
   headless browser. Download images/audio into `public/` or `assets/` first, reference by path.
6. **Keep any browser waits bounded** (`Promise.race` + timeout) if you add capture/scraping scripts.
   Unbounded waits hang the headless render.

## Where things live

- Re-skin the whole video: edit `remotion/src/theme.ts` (the only brand surface).
- Add a new scene type: extend `SceneSchema` (render side) **and** `InputSceneSchema` (input side),
  add a component, wire it in `compositions/VideoFromPlan.tsx` and the `switch` in `build-props.ts`.
- Change loudness / audio behavior: `scripts/mix.ts`.

## Before you hand back

Run `npm run doctor` (typecheck + format + toolchain). Commit `input/plan.json`, code, and docs —
never `render/`, `final/`, `node_modules/`, or `public/input/` (all gitignored).

Git: conventional commits, no `--amend`.

## Remotion authoring

For *how to write Remotion code* (animation, sequencing, effects, captions, fonts), defer to the
official skill: https://github.com/remotion-dev/skills. This repo is the pipeline harness on top.
