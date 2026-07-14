/**
 * BulletReveal — 3-4 ideas que aparecen escalonadas.
 * Sin viñetas: cada idea va separada por un filete fino que se traza.
 */
import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../theme/fonts';
import {
  color,
  duration,
  leading,
  space,
  type,
  weight,
} from '../theme/tokens';
import type { BulletRevealProps } from '../types/schema';
import { drawProgress, fadeUp } from './anim';
import { Kicker } from './atoms';

export const BulletReveal: React.FC<BulletRevealProps> = ({
  kicker,
  title,
  items,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickerA = fadeUp(frame, fps, { delay: 0 });
  const titleA = fadeUp(frame, fps, { delay: duration.fast });

  const baseDelay = title ? duration.slow : duration.fast;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.xl }}>
      {kicker ? <div style={kickerA}><Kicker>{kicker}</Kicker></div> : null}

      {title ? (
        <h2
          style={{
            ...titleA,
            margin: 0,
            fontFamily: fontFamily.serif,
            fontSize: type.title,
            fontWeight: weight.semibold,
            lineHeight: leading.tight,
            color: color.ink,
          }}
        >
          {title}
        </h2>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: space.md }}>
        {items.map((item, i) => {
          const delay = baseDelay + i * duration.slow;
          const textA = fadeUp(frame, fps, { delay: delay + duration.fast });
          // El filete se traza (escala en X desde la izquierda).
          const ruleP = drawProgress(frame, {
            delay,
            length: duration.draw,
          });

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  height: 2,
                  background: color.line,
                  transform: `scaleX(${ruleP})`,
                  transformOrigin: 'left center',
                }}
              />
              <div
                style={{
                  ...textA,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: space.lg,
                  padding: `${space.lg}px 0`,
                }}
              >
                <span
                  style={{
                    fontFamily: fontFamily.sans,
                    fontSize: type.label,
                    fontWeight: weight.semibold,
                    color: color.accent,
                    minWidth: 44,
                    opacity: interpolate(ruleP, [0, 1], [0, 1]),
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily: fontFamily.sans,
                    fontSize: type.body,
                    fontWeight: weight.regular,
                    lineHeight: leading.snug,
                    color: color.ink,
                  }}
                >
                  {item}
                </span>
              </div>
            </div>
          );
        })}
        {/* Filete de cierre inferior. */}
        <ClosingRule
          frame={frame}
          delay={baseDelay + items.length * duration.slow}
        />
      </div>
    </div>
  );
};

const ClosingRule: React.FC<{ frame: number; delay: number }> = ({
  frame,
  delay,
}) => {
  const p = drawProgress(frame, { delay, length: duration.draw });
  return (
    <div
      style={{
        height: 2,
        background: color.line,
        transform: `scaleX(${p})`,
        transformOrigin: 'left center',
      }}
    />
  );
};
