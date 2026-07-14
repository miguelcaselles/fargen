/**
 * AnimatedChart — gráfica de barras o de línea que se dibuja progresivamente.
 * Sin ejes recargados: filete de base, etiquetas discretas, un solo acento.
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
import type { AnimatedChartProps } from '../types/schema';
import { drawProgress, fadeUp } from './anim';
import { Footnote, Kicker } from './atoms';

const CHART_W = 888; // 1080 - 96*2
const CHART_H = 640;

export const AnimatedChart: React.FC<AnimatedChartProps> = ({
  kicker,
  title,
  variant,
  data,
  unit = '',
  footnote,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickerA = fadeUp(frame, fps, { delay: 0 });
  const titleA = fadeUp(frame, fps, { delay: duration.fast });
  const footA = fadeUp(frame, fps, { delay: duration.slow });

  const max = Math.max(...data.map((d) => d.value), 1);

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

      <div style={{ marginTop: space.md }}>
        {variant === 'bars' ? (
          <Bars data={data} max={max} unit={unit} frame={frame} />
        ) : (
          <Line data={data} max={max} unit={unit} frame={frame} />
        )}
      </div>

      {footnote ? (
        <div style={footA}>
          <Footnote>{footnote}</Footnote>
        </div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Barras
// ---------------------------------------------------------------------------
const Bars: React.FC<{
  data: AnimatedChartProps['data'];
  max: number;
  unit: string;
  frame: number;
}> = ({ data, max, unit, frame }) => {
  const gap = space.xl;
  const barW = (CHART_W - gap * (data.length - 1)) / data.length;

  return (
    <div style={{ position: 'relative', width: CHART_W, height: CHART_H }}>
      {/* Filete base */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 72,
          height: 2,
          background: color.line,
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap,
          height: CHART_H,
          position: 'absolute',
          bottom: 72,
        }}
      >
        {data.map((d, i) => {
          const delay = duration.slow + i * duration.stagger;
          const p = drawProgress(frame, { delay, length: duration.draw });
          const h = (d.value / max) * (CHART_H - 120) * p;
          const valueOpacity = interpolate(p, [0.6, 1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const highlight = d.value === max;
          return (
            <div
              key={i}
              style={{
                width: barW,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <span
                style={{
                  opacity: valueOpacity,
                  fontFamily: fontFamily.sans,
                  fontSize: type.label,
                  fontWeight: weight.semibold,
                  color: highlight ? color.accent : color.inkSoft,
                  marginBottom: space.sm,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {Math.round(d.value)}
                {unit}
              </span>
              <div
                style={{
                  width: '100%',
                  height: h,
                  background: highlight ? color.accent : color.sage,
                  borderRadius: 8,
                }}
              />
            </div>
          );
        })}
      </div>
      {/* Etiquetas eje X */}
      <div
        style={{
          display: 'flex',
          gap,
          position: 'absolute',
          bottom: 0,
          height: 60,
          alignItems: 'center',
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              width: barW,
              textAlign: 'center',
              fontFamily: fontFamily.sans,
              fontSize: type.label,
              color: color.inkSoft,
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Línea
// ---------------------------------------------------------------------------
const Line: React.FC<{
  data: AnimatedChartProps['data'];
  max: number;
  unit: string;
  frame: number;
}> = ({ data, max, unit, frame }) => {
  const padB = 72;
  const plotH = CHART_H - padB - 40;
  const n = data.length;
  const stepX = n > 1 ? CHART_W / (n - 1) : 0;

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: 40 + plotH - (d.value / max) * plotH,
    d,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const drawP = drawProgress(frame, {
    delay: duration.slow,
    length: duration.draw * 1.6,
  });

  return (
    <svg
      width={CHART_W}
      height={CHART_H}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      style={{ overflow: 'visible' }}
    >
      {/* Filete base */}
      <line
        x1={0}
        y1={40 + plotH}
        x2={CHART_W}
        y2={40 + plotH}
        stroke={color.line}
        strokeWidth={2}
      />
      {/* Trazo de la línea (dash animado) */}
      <path
        d={pathD}
        fill="none"
        stroke={color.accent}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - drawP}
      />
      {/* Puntos + etiquetas */}
      {points.map((p, i) => {
        const appear = i / Math.max(n - 1, 1);
        const on = drawP >= appear;
        const o = on ? 1 : 0;
        return (
          <g key={i} opacity={o}>
            <circle cx={p.x} cy={p.y} r={8} fill={color.bg} stroke={color.accent} strokeWidth={4} />
            <text
              x={p.x}
              y={p.y - 28}
              textAnchor="middle"
              fontFamily={fontFamily.sans}
              fontSize={type.label}
              fontWeight={600}
              fill={color.ink}
            >
              {Math.round(p.d.value)}
              {unit}
            </text>
            <text
              x={p.x}
              y={CHART_H - 12}
              textAnchor="middle"
              fontFamily={fontFamily.sans}
              fontSize={type.label}
              fill={color.inkSoft}
            >
              {p.d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
