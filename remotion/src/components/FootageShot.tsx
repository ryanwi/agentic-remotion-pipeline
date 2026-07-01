import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig } from "remotion";

/**
 * Thin wrapper over <OffthreadVideo> for b-roll / screen-recording clips.
 * Trims from `trimStartSec`, covers the frame, and stays muted — audio is added
 * later by scripts/mix.ts, never inside the composition.
 */
export const FootageShot: React.FC<{
  src: string;
  trimStartSec?: number;
  playbackRate?: number;
}> = ({ src, trimStartSec = 0, playbackRate = 1 }) => {
  const { fps } = useVideoConfig();
  const resolved = src.startsWith("http") ? src : staticFile(src);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={resolved}
        startFrom={Math.round(trimStartSec * fps)}
        playbackRate={playbackRate}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};
