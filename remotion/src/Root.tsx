import React from "react";
import { Composition, type CalculateMetadataFunction } from "remotion";
import { VideoFromPlan } from "./compositions/VideoFromPlan";
import { VideoPlanSchema, type VideoPlan } from "./schema";

/**
 * Duration AND dimensions are data-driven: they come from the props file that
 * `scripts/build-props.ts` writes to `render/props.json`. This is the
 * "props-as-timeline" contract — the composition has no fixed length.
 */
const calculateMetadata: CalculateMetadataFunction<VideoPlan> = ({ props }) => ({
  durationInFrames: Math.max(props.totalFrames, 1),
  fps: props.fps,
  width: props.width,
  height: props.height,
});

// A tiny inline plan so `remotion studio` works before you run build:props.
const demoProps: VideoPlan = {
  fps: 30,
  width: 1080,
  height: 1920,
  totalFrames: 120,
  captions: [],
  scenes: [
    {
      type: "title",
      startFrame: 0,
      durationFrames: 60,
      title: "Studio Preview",
      subtitle: "Run `npm run build:props` for the real plan",
    },
    {
      type: "end",
      startFrame: 60,
      durationFrames: 60,
      title: "agentic-remotion-pipeline",
      tagline: "JSON in, video out",
    },
  ],
};

export const Root: React.FC = () => {
  return (
    <Composition
      id="VideoFromPlan"
      component={VideoFromPlan}
      schema={VideoPlanSchema}
      defaultProps={demoProps}
      calculateMetadata={calculateMetadata}
      // Placeholders; the real values are set by calculateMetadata from props.
      durationInFrames={120}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
