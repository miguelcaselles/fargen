/**
 * TitleCard — gancho inicial. Titular grande (serif) + subtítulo (sans).
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
import type { TitleCardProps } from '../types/schema';
import { fadeUp } from './anim';
import { Kicker, Rule } from './atoms';

export const TitleCard: React.FC<TitleCardProps> = ({
  kicker,
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickerA = fadeUp(frame, fps, { delay: 0 });
  const titleA = fadeUp(frame, fps, { delay: duration.fast });
  const ruleA = fadeUp(frame, fps, { delay: duration.fast + duration.stagger });
  const subA = fadeUp(frame, fps, {
    delay: duration.fast + duration.stagger * 2,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.xl }}>
      {kicker ? <div style={kickerA}><Kicker>{kicker}</Kicker></div> : null}

      <h1
        style={{
          ...titleA,
          margin: 0,
          fontFamily: fontFamily.serif,
          fontSize: type.display,
          fontWeight: weight.semibold,
          lineHeight: leading.tight,
          letterSpacing: tracking.tight,
          color: color.ink,
        }}
      >
        {title}
      </h1>

      <div style={ruleA}>
        <Rule width={160} color={color.accent} thickness={4} />
      </div>

      {subtitle ? (
        <p
          style={{
            ...subA,
            margin: 0,
            maxWidth: 760,
            fontFamily: fontFamily.sans,
            fontSize: type.subtitle,
            fontWeight: weight.regular,
            lineHeight: leading.normal,
            color: color.inkSoft,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};
