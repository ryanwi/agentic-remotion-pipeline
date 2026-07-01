import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import type { CaptionWord } from "../schema";

/**
 * Groups word tokens into short phrases: max `maxWords` per chunk, and a new
 * chunk whenever there's a gap larger than `gapFrames` between words. Keeps
 * on-screen text readable instead of dumping a whole transcript line.
 */
export const chunkCaptions = (
  words: CaptionWord[],
  maxWords = 5,
  gapFrames = 12,
): CaptionWord[][] => {
  const chunks: CaptionWord[][] = [];
  let current: CaptionWord[] = [];
  for (const word of words) {
    const prev = current[current.length - 1];
    const bigGap = prev ? word.startFrame - prev.endFrame > gapFrames : false;
    if (current.length >= maxWords || bigGap) {
      if (current.length) chunks.push(current);
      current = [];
    }
    current.push(word);
  }
  if (current.length) chunks.push(current);
  return chunks;
};

/**
 * Karaoke caption overlay: shows the active phrase and highlights the current
 * word. Word timings are absolute frames on the whole-video timeline, so render
 * this at the top level of the composition (not inside a <Sequence>).
 */
export const Captions: React.FC<{ words: CaptionWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  if (!words.length) return null;

  const chunks = chunkCaptions(words);
  const active = chunks.find(
    (c) => frame >= c[0]!.startFrame && frame <= c[c.length - 1]!.endFrame,
  );
  if (!active) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 260,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 18px",
        padding: `0 ${theme.pad}px`,
      }}
    >
      {active.map((word, i) => {
        const isActive = frame >= word.startFrame && frame <= word.endFrame;
        return (
          <span
            key={i}
            style={{
              fontFamily: theme.fonts.display,
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
              color: isActive ? theme.colors.accent : theme.colors.text,
              textShadow: "0 4px 24px rgba(0,0,0,0.7)",
              transition: "none",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
