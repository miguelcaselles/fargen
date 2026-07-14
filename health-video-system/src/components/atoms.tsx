/**
 * atoms.tsx — pequeños elementos de UI compartidos, todos consumiendo tokens.
 * Kicker (antetítulo en versalitas), Rule (filete fino) y Footnote (pie).
 */
import React from 'react';
import { fontFamily } from '../theme/fonts';
import { color, tracking, type, weight } from '../theme/tokens';

/** Antetítulo corto en versalitas con tracking amplio. Marca de acento. */
export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color: c = color.accent,
}) => (
  <span
    style={{
      fontFamily: fontFamily.sans,
      fontSize: type.kicker,
      fontWeight: weight.semibold,
      letterSpacing: tracking.kicker,
      textTransform: 'uppercase',
      color: c,
    }}
  >
    {children}
  </span>
);

/** Filete fino horizontal. Sustituye a las viñetas feas. */
export const Rule: React.FC<{
  width?: number | string;
  color?: string;
  thickness?: number;
  style?: React.CSSProperties;
}> = ({ width = '100%', color: c = color.line, thickness = 2, style }) => (
  <div
    style={{
      width,
      height: thickness,
      background: c,
      borderRadius: thickness,
      ...style,
    }}
  />
);

/** Nota al pie / fuente, tinta tenue. */
export const Footnote: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span
    style={{
      fontFamily: fontFamily.sans,
      fontSize: type.label,
      fontWeight: weight.regular,
      color: color.inkFaint,
      letterSpacing: tracking.wide,
    }}
  >
    {children}
  </span>
);
