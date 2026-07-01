# Agent guide — conventions & why

This scaffold encodes a handful of hard-won conventions from building several agent-driven Remotion
video pipelines. Each rule exists because skipping it produces a subtle, hard-to-debug failure.

## Props-as-timeline

The composition takes a single frame-based `VideoPlan` prop and draws exactly that — no hardcoded
content, no fixed length. `Root.tsx`'s `calculateMetadata` derives `durationInFrames`, `fps`,
`width`, and `height` from the props. This is what makes the same composition produce a 15s vertical
short or a 3-minute landscape explainer without code changes.

The split between `input/plan.json` (seconds, human/LLM-authored) and `render/props.json` (frames,
generated) matters: humans and LLMs reason in seconds; Remotion reasons in frames. `build-props.ts`
is the one place the conversion happens, so timing bugs have a single home.

**Rule:** never hand-edit `render/props.json`. Regenerate it.

## Silent render, audio in post

Remotion renders **picture only**; `mix.ts` composites all audio afterward with ffmpeg and
normalizes to −14 LUFS (a two-pass linear loudnorm: measure, then correct). Reasons:

- Loudness normalization needs to analyze the whole mixed track — awkward inside a per-frame renderer.
- Re-muxing with `-c:v copy` means audio iteration doesn't re-render video (seconds vs minutes).
- The video stays reusable: same silent master, different audio beds.

The linear (not dynamic) loudnorm is deliberate — dynamic normalization would pump up silent
title/end sections into hiss.

## Localize assets, never hotlink

The render runs in a headless browser. Remote CDNs (podcast hosts, image CDNs) frequently 403 or
throttle datacenter/headless traffic, which stalls `delayRender` until timeout. Always download
images/audio locally first (`public/` for images the composition loads, `assets/` for audio `mix.ts`
consumes) and reference by path. Use `<Img>`/`<OffthreadVideo>`, never bare tags, so decoding is
awaited before the frame is captured.

## Scene durations are design choices

In this template each scene's `durationSec` is authored, not derived from audio. If you build a
transcript-synced variant (captions/cards timed to speech), compute frames from word timestamps in
`build-props.ts` and keep the composition unchanged — the props contract is the same.

## Extending

**A new scene type** touches four files, in this order:

1. `scripts/input-schema.ts` — add the seconds-based input variant to `InputSceneSchema`.
2. `remotion/src/schema.ts` — add the frame-based render variant to `SceneSchema`.
3. `scripts/build-props.ts` — add a `case` mapping input → render (seconds → frames).
4. `remotion/src/compositions/VideoFromPlan.tsx` — add a `case` rendering it, plus a component.

**A new brand** is just `remotion/src/theme.ts`.

## What this template intentionally omits

To stay a clean starting point, it ships without: transcript→caption auto-generation, audio waveform
visualizers, TTS/voiceover, two-timeline audio↔video anchor sync, and cloud (Lambda/Cloud Run)
rendering. Each is a real pattern from production pipelines but adds dependencies most projects don't
need on day one. The official [`remotion-dev/skills`](https://github.com/remotion-dev/skills) covers
the authoring side of most of these (captions, audio-viz, ElevenLabs voiceover) if you want to add
them.
