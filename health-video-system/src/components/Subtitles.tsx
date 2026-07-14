/**
 * Subtitles — subtítulos quemados, palabra a palabra, estilo limpio.
 *
 * Lee una pista de timings (SubtitleTrack) en segundos. En cada frame:
 *   - localiza la línea activa,
 *   - acumula las palabras ya pronunciadas de esa línea,
 *   - resalta la palabra que se está diciendo ahora (acento + peso).
 *
 * Se posiciona SIEMPRE dentro de la zona segura inferior (por encima de la
 * banda de 340 px de la UI de Reels/TikTok).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../theme/fonts';
import {
  color,
  leading,
  safeArea,
  space,
  type,
  weight,
} from '../theme/tokens';
import type { SubtitleTrack } from '../types/schema';

export const Subtitles: React.FC<{ track?: SubtitleTrack }> = ({ track }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (!track || track.lines.length === 0) return null;

  // Línea activa: la que contiene t; si estamos en un hueco, la última cuyo
  // inicio ya pasó (con una cola breve tras la última palabra).
  const TAIL = 0.4;
  let activeLine = -1;
  for (let i = 0; i < track.lines.length; i++) {
    const w = track.lines[i].words;
    if (w.length === 0) continue;
    const start = w[0].start;
    const end = w[w.length - 1].end + TAIL;
    if (t >= start && t <= end) {
      activeLine = i;
      break;
    }
    if (t > end) activeLine = i; // recordamos la última pasada
  }
  // Si la última recordada ya terminó (más allá de la cola), no mostramos nada.
  if (activeLine === -1) return null;
  const line = track.lines[activeLine];
  const lastEnd = line.words[line.words.length - 1].end + TAIL;
  if (t > lastEnd) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        // Aterriza el bloque completamente por encima de la banda segura inferior.
        paddingBottom: safeArea.bottom + 20,
        paddingLeft: safeArea.left,
        paddingRight: safeArea.right,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: `${space.xs}px ${space.sm}px`,
          maxWidth: 900,
        }}
      >
        {line.words.map((w, i) => {
          const spoken = t >= w.start;
          const active = t >= w.start && t <= w.end;
          if (!spoken) return null;
          return (
            <span
              key={i}
              style={{
                fontFamily: fontFamily.sans,
                fontSize: type.caption,
                fontWeight: active ? weight.semibold : weight.medium,
                lineHeight: leading.snug,
                color: active ? color.accent : color.ink,
                transition: 'none',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
