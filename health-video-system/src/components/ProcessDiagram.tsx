/**
 * ProcessDiagram — 3-5 pasos encadenados en vertical.
 * Cada paso aparece con fadeUp; el conector vertical entre pasos se traza
 * (escala en Y de arriba a abajo) antes de revelar el siguiente.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../theme/fonts';
import {
  color,
  duration,
  leading,
  space,
  type,
  weight,
} from '../theme/tokens';
import type { ProcessDiagramProps } from '../types/schema';
import { drawProgress, enterSpring, fadeUp } from './anim';
import { Kicker } from './atoms';

const NODE = 76; // diámetro del nodo numerado
const CONNECTOR_H = 44;

export const ProcessDiagram: React.FC<ProcessDiagramProps> = ({
  kicker,
  title,
  steps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickerA = fadeUp(frame, fps, { delay: 0 });
  const titleA = fadeUp(frame, fps, { delay: duration.fast });

  const startDelay = title ? duration.slow + duration.fast : duration.fast;
  const perStep = duration.slow + duration.stagger;

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

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: space.xs }}>
        {steps.map((step, i) => {
          const delay = startDelay + i * perStep;
          const nodeP = enterSpring(frame, fps, { delay });
          const textA = fadeUp(frame, fps, { delay: delay + duration.stagger });

          // Conector que baja HACIA este paso (excepto el primero).
          const connectorP =
            i === 0
              ? 1
              : drawProgress(frame, {
                  delay: delay - duration.slow,
                  length: duration.base,
                });

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
              {i > 0 ? (
                <div
                  style={{
                    width: NODE,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: CONNECTOR_H,
                      background: color.line,
                      transform: `scaleY(${connectorP})`,
                      transformOrigin: 'top center',
                    }}
                  />
                </div>
              ) : null}

              <div style={{ display: 'flex', alignItems: 'center', gap: space.lg }}>
                {/* Nodo numerado */}
                <div
                  style={{
                    width: NODE,
                    height: NODE,
                    flexShrink: 0,
                    borderRadius: '50%',
                    border: `3px solid ${color.accent}`,
                    background: color.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: fontFamily.serif,
                    fontSize: 38,
                    fontWeight: weight.semibold,
                    color: color.accent,
                    transform: `scale(${0.9 + nodeP * 0.1})`,
                    opacity: nodeP,
                  }}
                >
                  {i + 1}
                </div>

                {/* Texto del paso */}
                <div style={{ ...textA, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span
                    style={{
                      fontFamily: fontFamily.sans,
                      fontSize: 46,
                      fontWeight: weight.medium,
                      lineHeight: leading.snug,
                      color: color.ink,
                    }}
                  >
                    {step.title}
                  </span>
                  {step.detail ? (
                    <span
                      style={{
                        fontFamily: fontFamily.sans,
                        fontSize: 34,
                        fontWeight: weight.regular,
                        lineHeight: leading.snug,
                        color: color.inkSoft,
                      }}
                    >
                      {step.detail}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
