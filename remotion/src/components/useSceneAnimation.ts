import { interpolate, useCurrentFrame, Easing } from "remotion";

/**
 * Generic enter/exit transition for any full-screen scene: fade + slide-up on
 * the way in, fade on the way out. Frame-accurate to the scene's own duration.
 *
 * Drop into any component rendered inside a <Sequence durationInFrames={...}>.
 */
export const useSceneAnimation = (
  durationInFrames: number,
  opts: { inFrames?: number; outFrames?: number; slide?: number } = {},
) => {
  const { inFrames = 12, outFrames = 12, slide = 40 } = opts;
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, inFrames, durationInFrames - outFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const translateY = interpolate(frame, [0, inFrames], [slide, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return { opacity, translateY };
};
