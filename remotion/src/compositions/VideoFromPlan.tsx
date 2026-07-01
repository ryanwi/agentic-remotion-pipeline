import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "../theme";
import type { Scene, VideoPlan } from "../schema";
import { TitleCard } from "../components/TitleCard";
import { EndCard } from "../components/EndCard";
import { QuoteScene } from "../components/QuoteScene";
import { StatScene } from "../components/StatScene";
import { ImageScene } from "../components/ImageScene";
import { FootageShot } from "../components/FootageShot";
import { Callout } from "../components/Callout";
import { Captions } from "../components/Captions";

const SceneBody: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case "title":
      return (
        <TitleCard
          title={scene.title}
          subtitle={scene.subtitle}
          durationInFrames={scene.durationFrames}
        />
      );
    case "quote":
      return (
        <QuoteScene
          quote={scene.quote}
          attribution={scene.attribution}
          durationInFrames={scene.durationFrames}
        />
      );
    case "stat":
      return (
        <StatScene
          value={scene.value}
          label={scene.label}
          durationInFrames={scene.durationFrames}
        />
      );
    case "image":
      return (
        <ImageScene
          src={scene.src}
          caption={scene.caption}
          source={scene.source}
          kenBurns={scene.kenBurns}
          durationInFrames={scene.durationFrames}
        />
      );
    case "video":
      return (
        <AbsoluteFill>
          <FootageShot
            src={scene.src}
            trimStartSec={scene.trimStartSec}
            playbackRate={scene.playbackRate}
          />
          {scene.callouts.map((c, i) => (
            <Sequence key={i} from={c.atFrame} durationInFrames={c.durationFrames} layout="none">
              <Callout {...c} />
            </Sequence>
          ))}
        </AbsoluteFill>
      );
    case "end":
      return (
        <EndCard
          title={scene.title}
          tagline={scene.tagline}
          durationInFrames={scene.durationFrames}
        />
      );
  }
};

/**
 * The one composition. Everything it draws comes from `plan` — no hardcoded
 * content, no fixed duration. Scenes are laid out on the timeline by their
 * pre-computed `startFrame`; the karaoke caption overlay (if any) rides on top.
 */
export const VideoFromPlan: React.FC<VideoPlan> = (plan) => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      {plan.scenes.map((scene) => (
        <Sequence
          key={`${scene.type}-${scene.startFrame}`}
          from={scene.startFrame}
          durationInFrames={scene.durationFrames}
          layout="none"
        >
          <SceneBody scene={scene} />
        </Sequence>
      ))}

      {plan.captions.length ? <Captions words={plan.captions} /> : null}
    </AbsoluteFill>
  );
};
