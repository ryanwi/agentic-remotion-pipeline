import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { KenBurns } from "../schema";

/**
 * Ken Burns effect: slow scale + pan over the lifetime of a scene. Wrap any
 * content (an <Img>, a <Video>, even a CSS gradient) to give it motion.
 *
 * Uses individual CSS transform properties (scale/translate) rather than a
 * composed `transform` string so the animation stays editable in Remotion Studio.
 */
export const ZoomPan: React.FC<{
  durationInFrames: number;
  kenBurns?: Partial<KenBurns>;
  children: React.ReactNode;
}> = ({ durationInFrames, kenBurns, children }) => {
  const frame = useCurrentFrame();
  const kb = {
    fromScale: 1,
    toScale: 1.12,
    fromX: 0,
    toX: 0,
    fromY: 0,
    toY: 0,
    ...kenBurns,
  };

  const range: [number, number] = [0, durationInFrames];
  const scale = interpolate(frame, range, [kb.fromScale, kb.toScale], {
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, range, [kb.fromX, kb.toX], { extrapolateRight: "clamp" });
  const y = interpolate(frame, range, [kb.fromY, kb.toY], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(scale),
          translate: `${x}px ${y}px`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
