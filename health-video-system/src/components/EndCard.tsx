/**
 * EndCard — cierre con mensaje de reflexión, nombre, handle y logotipo.
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
import type { EndCardProps } from '../types/schema';
import { fadeUp } from './anim';
import { Rule } from './atoms';
import { Logo } from './Logo';

export const EndCard: React.FC<EndCardProps> = ({ name, handle, message }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const msgA = fadeUp(frame, fps, { delay: 0 });
  const ruleA = fadeUp(frame, fps, { delay: duration.slow });
  const logoA = fadeUp(frame, fps, { delay: duration.slow + duration.stagger });
  const nameA = fadeUp(frame, fps, {
    delay: duration.slow + duration.stagger * 2,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: space.xl,
      }}
    >
      {message ? (
        <h2
          style={{
            ...msgA,
            margin: 0,
            maxWidth: 820,
            fontFamily: fontFamily.serif,
            fontSize: type.title,
            fontWeight: weight.semibold,
            lineHeight: leading.tight,
            letterSpacing: tracking.tight,
            color: color.ink,
          }}
        >
          {message}
        </h2>
      ) : null}

      <div style={ruleA}>
        <Rule width={120} color={color.accent} thickness={4} />
      </div>

      <div style={logoA}>
        <Logo size={132} />
      </div>

      <div
        style={{
          ...nameA,
          display: 'flex',
          flexDirection: 'column',
          gap: space.xs,
        }}
      >
        <span
          style={{
            fontFamily: fontFamily.sans,
            fontSize: type.subtitle,
            fontWeight: weight.semibold,
            color: color.ink,
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: fontFamily.sans,
            fontSize: type.body,
            fontWeight: weight.regular,
            letterSpacing: tracking.wide,
            color: color.accent,
          }}
        >
          {handle}
        </span>
      </div>
    </div>
  );
};
