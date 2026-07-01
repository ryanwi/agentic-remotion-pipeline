import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";
import { useSceneAnimation } from "./useSceneAnimation";

export const TitleCard: React.FC<{
  title: string;
  subtitle?: string;
  durationInFrames: number;
}> = ({ title, subtitle, durationInFrames }) => {
  const { opacity, translateY } = useSceneAnimation(durationInFrames);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.bg,
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
            color: theme.colors.text,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.sizes.body,
              color: theme.colors.accent,
              marginTop: 28,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
