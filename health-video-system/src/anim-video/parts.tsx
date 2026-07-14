/**
 * parts.tsx — piezas ilustradas reutilizables para las escenas animadas.
 * Todo consume tokens. Animaciones suaves (spring/ease-out), sin flashes.
 */
import React from 'react';
import { interpolate } from 'remotion';
import { fontFamily } from '../theme/fonts';
import { color, illustration as ill, tracking, type, weight } from '../theme/tokens';

type Pt = [number, number];

/** Punto sobre Bézier cuadrática. */
export function quad(p0: Pt, c: Pt, p1: Pt, u: number): Pt {
  const m = 1 - u;
  return [
    m * m * p0[0] + 2 * m * u * c[0] + u * u * p1[0],
    m * m * p0[1] + 2 * m * u * c[1] + u * u * p1[1],
  ];
}

/** Inyector (pen) reutilizable, dibujado alrededor del origen. */
export const InjectorPen: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <rect x={-9} y={-8} width={18} height={58} rx={8} fill={color.surface} stroke={color.ink} strokeWidth={3} />
    <rect x={-9} y={-8} width={18} height={16} rx={8} fill={ill.garmentAccent} />
    <rect x={-3} y={50} width={6} height={13} rx={3} fill={color.inkSoft} />
  </g>
);

/** Teléfono con pulso en pantalla. */
export const Phone: React.FC<{ x: number; y: number; active?: boolean; scale?: number }> = ({
  x,
  y,
  active = false,
  scale = 1,
}) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-32} y={-58} width={64} height={116} rx={14} fill={color.ink} />
    <rect x={-25} y={-50} width={50} height={100} rx={9} fill={color.surface} />
    <path
      d="M-18 6 l9 0 l7 -20 l9 34 l7 -14 l7 0"
      fill="none"
      stroke={active ? color.accent : color.line}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

/** Mesita auxiliar. */
export const SideTable: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 120 }) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={16} rx={8} fill={ill.garmentAlt} />
    <rect x={x - w / 2 + 10} y={y + 16} width={12} height={150} rx={6} fill={ill.garmentAlt} />
    <rect x={x + w / 2 - 22} y={y + 16} width={12} height={150} rx={6} fill={ill.garmentAlt} />
  </g>
);

/** Tarjeta "hospital" con cruz (equipo / farmacia). */
export const HospitalCard: React.FC<{ x: number; y: number; scale?: number; dim?: boolean }> = ({
  x,
  y,
  scale = 1,
  dim = false,
}) => (
  <g transform={`translate(${x},${y}) scale(${scale})`} opacity={dim ? 0.4 : 1}>
    <rect x={-70} y={-70} width={140} height={140} rx={28} fill={color.surface} stroke={color.line} strokeWidth={3} />
    <rect x={-70} y={-70} width={140} height={26} rx={13} fill={ill.garmentAccent} />
    <g stroke={color.accent} strokeWidth={12} strokeLinecap="round">
      <line x1={0} y1={-18} x2={0} y2={34} />
      <line x1={-26} y1={8} x2={26} y2={8} />
    </g>
  </g>
);

/** Bocadillo de diálogo con contenido, escala-in desde una esquina. */
export const SpeechBubble: React.FC<{
  x: number;
  y: number;
  p: number; // 0..1 aparición
  w?: number;
  h?: number;
  tail?: 'bl' | 'br';
  children: React.ReactNode;
}> = ({ x, y, p, w = 150, h = 120, tail = 'bl', children }) => {
  const tx = tail === 'bl' ? -w / 2 + 30 : w / 2 - 30;
  return (
    <g transform={`translate(${x},${y}) scale(${p})`} style={{ transformOrigin: '0 100%' }} opacity={p}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={26} fill={color.surface} stroke={color.line} strokeWidth={3} />
      <path d={`M${tx} ${-6} l${tail === 'bl' ? -14 : 14} 30 l${tail === 'bl' ? 26 : -26} -26 Z`} fill={color.surface} stroke={color.line} strokeWidth={3} />
      <g transform={`translate(0, ${-h / 2})`}>{children}</g>
    </g>
  );
};

/** Check que se dibuja. */
export const DrawnCheck: React.FC<{ p: number; size?: number; col?: string }> = ({
  p,
  size = 1,
  col = color.sage,
}) => (
  <path
    d="M-30 0 l20 24 l38 -46"
    transform={`scale(${size})`}
    fill="none"
    stroke={col}
    strokeWidth={10}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={1 - p}
  />
);

/** Interrogación / thought bubble sencillo. */
export const ThoughtBubble: React.FC<{ x: number; y: number; p: number; children: React.ReactNode }> = ({
  x,
  y,
  p,
  children,
}) => (
  <g transform={`translate(${x},${y}) scale(${p})`} opacity={p}>
    <circle cx={0} cy={0} r={54} fill={color.surface} stroke={color.line} strokeWidth={3} />
    <circle cx={-46} cy={44} r={12} fill={color.surface} stroke={color.line} strokeWidth={3} />
    <circle cx={-64} cy={66} r={7} fill={color.surface} stroke={color.line} strokeWidth={3} />
    {children}
  </g>
);

/** Calendario con dosis marcadas; una se salta (X terracota). */
export const DoseCalendar: React.FC<{ x: number; y: number; reveal: number; missAt?: number }> = ({
  x,
  y,
  reveal,
  missAt = 4,
}) => {
  const cells = 6;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-190} y={-150} width={380} height={300} rx={24} fill={color.surface} stroke={color.line} strokeWidth={3} />
      <rect x={-190} y={-150} width={380} height={54} rx={24} fill={ill.garment} />
      <rect x={-190} y={-118} width={380} height={22} fill={ill.garment} />
      {Array.from({ length: cells }).map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = -110 + col * 110;
        const cy = -40 + row * 96;
        const on = reveal > (i + 1) / (cells + 1);
        const miss = i === missAt;
        return (
          <g key={i} opacity={on ? 1 : 0.15}>
            <rect x={cx - 42} y={cy - 34} width={84} height={72} rx={14} fill={color.bg} stroke={color.line} strokeWidth={2} />
            {on ? (
              miss ? (
                <g stroke={color.accent} strokeWidth={7} strokeLinecap="round">
                  <line x1={cx - 16} y1={cy - 12} x2={cx + 16} y2={cy + 16} />
                  <line x1={cx + 16} y1={cy - 12} x2={cx - 16} y2={cy + 16} />
                </g>
              ) : (
                <circle cx={cx} cy={cy + 2} r={16} fill={ill.garment} />
              )
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/** Rótulo de escena (kicker + título) en la zona superior segura. */
export const SceneLabel: React.FC<{
  kicker?: string;
  title: string;
  opacity: number;
  y?: number;
}> = ({ kicker, title, opacity, y = 340 }) => (
  <g style={{ opacity }}>
    {kicker ? (
      <text
        x={96}
        y={y}
        fontFamily={fontFamily.sans}
        fontSize={type.kicker}
        fontWeight={weight.semibold}
        letterSpacing={tracking.kicker}
        fill={color.accent}
        style={{ textTransform: 'uppercase' }}
      >
        {kicker.toUpperCase()}
      </text>
    ) : null}
    <text
      x={94}
      y={y + 78}
      fontFamily={fontFamily.serif}
      fontSize={type.title}
      fontWeight={weight.semibold}
      fill={color.ink}
    >
      {title.split('\n').map((line, i) => (
        <tspan key={i} x={94} dy={i === 0 ? 0 : type.title * 1.02}>
          {line}
        </tspan>
      ))}
    </text>
  </g>
);

/** Línea de datos punteada (teléfono → hospital). */
export const DataLine: React.FC<{ from: Pt; ctrl: Pt; to: Pt; p: number }> = ({ from, ctrl, to, p }) => (
  <path
    d={`M${from[0]} ${from[1]} Q${ctrl[0]} ${ctrl[1]} ${to[0]} ${to[1]}`}
    fill="none"
    stroke={color.line}
    strokeWidth={3}
    strokeDasharray="2 16"
    strokeLinecap="round"
    opacity={0.9 * p}
  />
);

/** Puntos de datos viajando por la línea. */
export const DataDots: React.FC<{
  from: Pt;
  ctrl: Pt;
  to: Pt;
  frame: number;
  start: number;
  count?: number;
  gap?: number;
  span?: number;
}> = ({ from, ctrl, to, frame, start, count = 5, gap = 14, span = 46 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => {
      const local = frame - (start + i * gap);
      if (local < 0) return null;
      const u = interpolate(local, [0, span], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      if (u >= 1) return null;
      const [px, py] = quad(from, ctrl, to, u);
      const o = interpolate(u, [0, 0.12, 0.85, 1], [0, 1, 1, 0]);
      return <circle key={i} cx={px} cy={py} r={8} fill={color.accent} opacity={o} />;
    })}
  </>
);
