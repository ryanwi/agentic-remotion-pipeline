import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { Callout as CalloutData } from "../schema";

/**
 * Animated lower-third / callout. Springs in from an edge, holds, fades out.
 * Position the wrapping <Sequence> to control when it appears.
 */
export const Callout: React.FC<CalloutData> = ({ text, body, from, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });
  const offset = interpolate(enter, [0, 1], [from === "bottom" ? 80 : 120, 0]);
  const opacity = interpolate(frame, [0, 12, durationFrames - 12, durationFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const anchor: React.CSSProperties =
    from === "left"
      ? { left: theme.pad, bottom: theme.pad, translate: `${-offset}px 0` }
      : from === "right"
        ? { right: theme.pad, bottom: theme.pad, translate: `${offset}px 0` }
        : { left: theme.pad, right: theme.pad, bottom: theme.pad, translate: `0 ${offset}px` };

  return (
    <div
      style={{
        position: "absolute",
        ...anchor,
        opacity,
        maxWidth: 760,
        padding: "26px 34px",
        background: "rgba(20,20,20,0.82)",
        borderLeft: `8px solid ${theme.colors.accent}`,
        borderRadius: 16,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontSize: theme.sizes.caption,
          fontWeight: 700,
          color: theme.colors.text,
          lineHeight: 1.1,
        }}
      >
        {text}
      </div>
      {body ? (
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 28,
            color: theme.colors.muted,
            marginTop: 8,
          }}
        >
          {body}
        </div>
      ) : null}
    </div>
  );
};
