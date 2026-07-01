import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { theme } from "../theme";
import { ZoomPan } from "./ZoomPan";
import { useSceneAnimation } from "./useSceneAnimation";
import type { KenBurns } from "../schema";

/**
 * Full-frame image with a Ken Burns move, a bottom gradient scrim, an optional
 * caption (lower-third) and a small source-attribution credit.
 *
 * Always uses Remotion's <Img> (never a bare <img>) so the frame isn't captured
 * before a large image decodes. `src` is resolved via staticFile() — localize
 * remote URLs at build time (see scripts/build-props.ts).
 */
export const ImageScene: React.FC<{
  src: string;
  caption?: string;
  source?: string;
  kenBurns?: KenBurns;
  durationInFrames: number;
}> = ({ src, caption, source, kenBurns, durationInFrames }) => {
  const { opacity } = useSceneAnimation(durationInFrames, { slide: 0 });
  const resolved = src.startsWith("http") ? src : staticFile(src);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg, opacity }}>
      <ZoomPan durationInFrames={durationInFrames} kenBurns={kenBurns}>
        <Img src={resolved} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </ZoomPan>

      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 42%)",
        }}
      />

      {caption ? (
        <div
          style={{
            position: "absolute",
            left: theme.pad,
            right: theme.pad,
            bottom: theme.pad,
          }}
        >
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontSize: theme.sizes.h2,
              fontWeight: 700,
              color: theme.colors.text,
              lineHeight: 1.1,
            }}
          >
            {caption}
          </div>
          {source ? (
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.sizes.kicker,
                color: theme.colors.muted,
                marginTop: 10,
              }}
            >
              {source}
            </div>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
