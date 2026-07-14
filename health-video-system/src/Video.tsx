/**
 * Video.tsx — el MOTOR. Lee un guion (VideoScript) + una pista de subtítulos
 * y monta el vídeo:
 *   - fondo crema constante,
 *   - locución (Narration),
 *   - una <Sequence> por escena, encadenadas sin solape (la suma de
 *     duraciones = duración total, invariante que valida el esquema),
 *   - una transición de fade suave dentro de cada escena (SceneWrapper),
 *   - subtítulos quemados por encima (Subtitles).
 *
 * Para un vídeo nuevo NO se toca este archivo: solo se cambia el JSON.
 */
import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import { Narration } from './components/Narration';
import { renderScene } from './components/registry';
import { SafeArea } from './components/SafeArea';
import { Subtitles } from './components/Subtitles';
import { color, duration as dur, easing } from './theme/tokens';
import { bezier } from './components/anim';
import type { SubtitleTrack, VideoScript } from './types/schema';

export type VideoProps = {
  script: VideoScript;
  track?: SubtitleTrack;
  /** Muestra guías de zona segura (solo para ajustar; false al renderizar). */
  showSafeGuides?: boolean;
};

/**
 * Envoltura de escena: aplica un fade de entrada y de salida al conjunto.
 * Como el fondo es constante, el cruce entre escenas se lee como un
 * cross-dissolve calmado a través del mismo crema. Sin flashes.
 */
const SceneWrapper: React.FC<{
  durationInFrames: number;
  children: React.ReactNode;
  showSafeGuides?: boolean;
}> = ({ durationInFrames, children, showSafeGuides }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, dur.crossfade], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => bezier(easing.gentle, x),
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - dur.crossfade, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (x) => bezier(easing.gentle, x),
    },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ opacity }}>
      <SafeArea align="center" debug={showSafeGuides}>
        {children}
      </SafeArea>
    </AbsoluteFill>
  );
};

export const Video: React.FC<VideoProps> = ({
  script,
  track,
  showSafeGuides = false,
}) => {
  let from = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      {/* Locución */}
      <Narration src={script.meta.audio} />

      {/* Escenas encadenadas */}
      {script.scenes.map((scene, i) => {
        const el = (
          <Sequence
            key={i}
            from={from}
            durationInFrames={scene.durationInFrames}
            name={scene.id ?? `${i + 1}·${scene.component}`}
          >
            <SceneWrapper
              durationInFrames={scene.durationInFrames}
              showSafeGuides={showSafeGuides}
            >
              {renderScene(scene)}
            </SceneWrapper>
          </Sequence>
        );
        from += scene.durationInFrames;
        return el;
      })}

      {/* Subtítulos quemados por encima de todo */}
      <Subtitles track={track} />
    </AbsoluteFill>
  );
};
