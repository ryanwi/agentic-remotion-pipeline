import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";
import { useSceneAnimation } from "./useSceneAnimation";

/** Pull-quote card. Auto-scales font size down for longer quotes so they fit. */
export const QuoteScene: React.FC<{
  quote: string;
  attribution?: string;
  durationInFrames: number;
}> = ({ quote, attribution, durationInFrames }) => {
  const { opacity, translateY } = useSceneAnimation(durationInFrames);
  const clipped = quote.length > 180 ? quote.slice(0, 177).trimEnd() + "…" : quote;
  const fontSize = clipped.length > 120 ? 56 : clipped.length > 70 ? 68 : 82;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.surface,
        justifyContent: "center",
        padding: theme.pad,
      }}
    >
      <div style={{ opacity, translate: `0 ${translateY}px` }}>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontSize: 160,
            fontWeight: 700,
            color: theme.colors.accent,
            lineHeight: 0.6,
          }}
        >
          &ldquo;
        </div>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontSize,
            fontWeight: 600,
            color: theme.colors.text,
            lineHeight: 1.15,
            marginTop: 12,
          }}
        >
          {clipped}
        </div>
        {attribution ? (
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.sizes.caption,
              color: theme.colors.muted,
              marginTop: 36,
            }}
          >
            — {attribution}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
