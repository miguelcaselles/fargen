/**
 * AnimatedVideo.tsx — vídeo COMPLETO con personajes ilustrados animados.
 * Secuencia las escenas de scenes.tsx con fundidos suaves, añade la locución
 * y los subtítulos quemados. Mantiene tokens, zonas seguras y placeholders.
 *
 * (El sistema tipográfico dirigido por JSON sigue viviendo en Video.tsx; este
 * es el vídeo ilustrado, compuesto en código porque las poses de personaje no
 * se prestan a un simple JSON.)
 */
import React from 'react';
import { AbsoluteFill, interpolate, Sequence, staticFile, Audio, useCurrentFrame } from 'remotion';
import { color, duration as dur, easing } from '../theme/tokens';
import { bezier } from '../components/anim';
import { Subtitles } from '../components/Subtitles';
import type { SubtitleTrack } from '../types/schema';
import timings from '../scripts/adherencia-animado.timings.json';
import {
  SceneCierre,
  SceneComoFunciona,
  SceneDato,
  SceneGancho,
  SceneProblema,
} from './scenes';

const track = timings as SubtitleTrack;

const SCENES: { node: React.ReactNode; d: number; name: string }[] = [
  { node: <SceneGancho />, d: 255, name: '1·Gancho' },
  { node: <SceneProblema />, d: 270, name: '2·Problema' },
  { node: <SceneComoFunciona />, d: 330, name: '3·CómoFunciona' },
  { node: <SceneDato />, d: 255, name: '4·Dato' },
  { node: <SceneCierre />, d: 240, name: '5·Cierre' },
];

export const ANIM_TOTAL = SCENES.reduce((a, s) => a + s.d, 0); // 1350

const Fade: React.FC<{ d: number; children: React.ReactNode }> = ({ d, children }) => {
  const frame = useCurrentFrame();
  const fin = interpolate(frame, [0, dur.crossfade], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => bezier(easing.gentle, x),
  });
  const fout = interpolate(frame, [d - dur.crossfade, d], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => bezier(easing.gentle, x),
  });
  return <AbsoluteFill style={{ opacity: Math.min(fin, fout) }}>{children}</AbsoluteFill>;
};

export const AnimatedVideo: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      <Audio src={staticFile('audio/silence.mp3')} />
      {SCENES.map((s, i) => {
        const el = (
          <Sequence key={i} from={from} durationInFrames={s.d} name={s.name}>
            <Fade d={s.d}>{s.node}</Fade>
          </Sequence>
        );
        from += s.d;
        return el;
      })}
      <Subtitles track={track} />
    </AbsoluteFill>
  );
};
