/**
 * QuoteCard — frase destacada. Comilla serif grande, filete de acento.
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
import type { QuoteCardProps } from '../types/schema';
import { fadeUp } from './anim';
import { Rule } from './atoms';

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, attribution }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const markA = fadeUp(frame, fps, { delay: 0, distance: 16 });
  const quoteA = fadeUp(frame, fps, { delay: duration.fast });
  const ruleA = fadeUp(frame, fps, { delay: duration.slow });
  const attrA = fadeUp(frame, fps, { delay: duration.slow + duration.stagger });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.xl }}>
      <div
        style={{
          ...markA,
          fontFamily: fontFamily.serif,
          fontSize: 200,
          lineHeight: 0.7,
          fontWeight: weight.bold,
          color: color.accent,
          height: 120,
        }}
      >
        &ldquo;
      </div>

      <blockquote
        style={{
          ...quoteA,
          margin: 0,
          fontFamily: fontFamily.serif,
          fontSize: type.title,
          fontWeight: weight.regular,
          fontStyle: 'italic',
          lineHeight: leading.snug,
          letterSpacing: tracking.tight,
          color: color.ink,
        }}
      >
        {quote}
      </blockquote>

      <div style={ruleA}>
        <Rule width={120} color={color.accent} thickness={4} />
      </div>

      {attribution ? (
        <span
          style={{
            ...attrA,
            fontFamily: fontFamily.sans,
            fontSize: type.subtitle,
            fontWeight: weight.medium,
            color: color.inkSoft,
          }}
        >
          {attribution}
        </span>
      ) : null}
    </div>
  );
};
