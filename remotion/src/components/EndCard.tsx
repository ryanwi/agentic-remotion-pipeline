import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";
import { useSceneAnimation } from "./useSceneAnimation";

export const EndCard: React.FC<{
  title: string;
  tagline?: string;
  durationInFrames: number;
}> = ({ title, tagline, durationInFrames }) => {
  const { opacity, translateY } = useSceneAnimation(durationInFrames);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.accent,
        justifyContent: "center",
        alignItems: "center",
        padding: theme.pad,
        textAlign: "center",
      }}
    >
      <div style={{ opacity, translate: `0 ${translateY}px` }}>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontSize: theme.sizes.h1,
            fontWeight: 700,
            color: theme.colors.accentText,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        {tagline ? (
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.sizes.body,
              color: theme.colors.accentText,
              opacity: 0.75,
              marginTop: 24,
            }}
          >
            {tagline}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
