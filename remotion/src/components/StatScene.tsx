import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";
import { useSceneAnimation } from "./useSceneAnimation";

/** A single big-number "by the numbers" card. */
export const StatScene: React.FC<{
  value: string;
  label: string;
  durationInFrames: number;
}> = ({ value, label, durationInFrames }) => {
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
            fontSize: theme.sizes.stat,
            fontWeight: 700,
            color: theme.colors.accent,
            lineHeight: 0.9,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.sizes.h2,
            color: theme.colors.text,
            marginTop: 16,
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
