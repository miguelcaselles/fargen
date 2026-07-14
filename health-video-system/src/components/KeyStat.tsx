/**
 * KeyStat — una cifra enorme que cuenta hacia arriba + etiqueta.
 *
 * Si `value` es número → cuenta de `from` a `value` con ease-out.
 * Si `value` es string (p.ej. "XX" PLACEHOLDER) → se muestra tal cual, sin
 * contar. Así respetamos la regla de no inventar cifras.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../theme/fonts';
import {
  color,
  duration,
  leading,
  space,
  tracking,
  type,
  weight,
} from '../theme/tokens';
import type { KeyStatProps } from '../types/schema';
import { drawProgress, fadeUp } from './anim';
import { Footnote, Kicker } from './atoms';

export const KeyStat: React.FC<KeyStatProps> = ({
  kicker,
  value,
  from = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  label,
  footnote,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isNumeric = typeof value === 'number';

  // Conteo con ease-out (arranca tras un breve respiro).
  const countP = drawProgress(frame, {
    delay: duration.fast,
    length: duration.slow * 2,
  });
  const current = isNumeric
    ? (from + (value - from) * countP).toFixed(decimals)
    : value;

  const kickerA = fadeUp(frame, fps, { delay: 0 });
  const statA = fadeUp(frame, fps, { delay: duration.fast, distance: 20 });
  const labelA = fadeUp(frame, fps, { delay: duration.slow });
  const footA = fadeUp(frame, fps, { delay: duration.slow + duration.stagger });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: space.lg,
      }}
    >
      {kicker ? <div style={kickerA}><Kicker>{kicker}</Kicker></div> : null}

      <div
        style={{
          ...statA,
          display: 'flex',
          alignItems: 'baseline',
          fontFamily: fontFamily.serif,
          fontSize: type.stat,
          fontWeight: weight.semibold,
          lineHeight: leading.tight,
          letterSpacing: tracking.tight,
          color: color.ink,
          // tabular-nums evita que la cifra "baile" mientras cuenta.
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum" 1',
        }}
      >
        {prefix ? (
          <span style={{ fontSize: '0.42em', marginRight: 8 }}>{prefix}</span>
        ) : null}
        <span>{current}</span>
        {suffix ? (
          <span style={{ fontSize: '0.42em', marginLeft: 8, color: color.accent }}>
            {suffix}
          </span>
        ) : null}
      </div>

      <p
        style={{
          ...labelA,
          margin: 0,
          maxWidth: 780,
          fontFamily: fontFamily.sans,
          fontSize: type.subtitle,
          fontWeight: weight.regular,
          lineHeight: leading.snug,
          color: color.inkSoft,
        }}
      >
        {label}
      </p>

      {footnote ? (
        <div style={{ ...footA, marginTop: space.sm }}>
          <Footnote>{footnote}</Footnote>
        </div>
      ) : null}
    </div>
  );
};
