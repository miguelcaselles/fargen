/**
 * Person — personaje 2D plano REUTILIZABLE y posable, estilo japandi.
 *
 * Más detallado que la primera prueba: proporciones más adultas, manos con
 * pulgar, cejas + nariz + boca expresiva, y brazos posables mediante objetivos
 * de mano (cada mano se lleva a un punto; el codo se calcula solo con una
 * flexión natural). Respira y parpadea a partir del `frame` local.
 *
 * Se dibuja dentro de un <svg viewBox="0 0 1080 1920">, anclado por los pies.
 */
import React from 'react';

export type Palette = {
  skin: string;
  skinShade: string;
  hair: string;
  garment: string;
  garmentDark: string;
  accent: string;
  ink: string;
  line: string;
};

export type Expression = 'neutral' | 'smile' | 'happy' | 'worried' | 'think';
export type HairStyle = 'short' | 'bun' | 'coat-cap';

type Pt = [number, number];

export type PersonPose = {
  /** Objetivo de la mano izquierda (lado pantalla izq.), absoluto en el lienzo. */
  leftHand?: Pt;
  /** Objetivo de la mano derecha (lado pantalla der.), absoluto. */
  rightHand?: Pt;
  /** Inclinación de cabeza en grados (+ derecha). */
  headTilt?: number;
  /** Objeto sostenido por una mano (p. ej. inyector). */
  hold?: { hand: 'left' | 'right'; node: React.ReactNode; angle?: number };
};

export type PersonProps = {
  /** Centro X y suelo (Y de los pies) en el lienzo 1080x1920. */
  cx: number;
  groundY: number;
  /** Escala (1 = ~640 px de alto). */
  scale?: number;
  palette: Palette;
  expression?: Expression;
  hair?: HairStyle;
  /** Gafas (p. ej. farmacéutico). */
  glasses?: boolean;
  /** Frame local para respiración/parpadeo. */
  frame: number;
  pose?: PersonPose;
  /** Mira a la izquierda (voltea la cara). */
  faceLeft?: boolean;
};

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const len = (a: Pt) => Math.hypot(a[0], a[1]);

/**
 * Codo natural: punto medio desplazado una cantidad FIJA en perpendicular
 * (hacia el lado `side`). Al ser fija, los brazos colgando quedan casi rectos
 * y los brazos que alcanzan un objetivo abren un codo discreto.
 */
function elbow(s: Pt, h: Pt, side: number, bendPx = 18): Pt {
  const mid: Pt = [(s[0] + h[0]) / 2, (s[1] + h[1]) / 2];
  const d = sub(h, s);
  const l = len(d) || 1;
  const nx = (-d[1] / l) * side;
  const ny = (d[0] / l) * side;
  return [mid[0] + nx * bendPx, mid[1] + ny * bendPx];
}

function blinkAt(frame: number): number {
  const blinks = [40, 118, 176, 232];
  let v = 1;
  for (const b of blinks) {
    const dd = Math.abs(frame - b);
    if (dd < 4) v = Math.min(v, dd / 4);
  }
  return v;
}

export const Person: React.FC<PersonProps> = ({
  cx,
  groundY,
  scale = 1,
  palette: p,
  expression = 'neutral',
  hair = 'short',
  glasses = false,
  frame,
  pose = {},
  faceLeft = false,
}) => {
  // Respiración sutil.
  const breathe = Math.sin(frame / 15) * 3;
  const eye = blinkAt(frame);

  // Puntos base (en coords locales, antes de escalar/trasladar).
  // Origen local: (0,0) = punto entre los pies; y hacia arriba = negativo.
  const H = 640; // altura de referencia
  const headR = 58;
  const headC: Pt = [0, -H + 74]; // centro cabeza (arriba)
  const shoulderY = -H + 205;
  const shL: Pt = [-74, shoulderY];
  const shR: Pt = [74, shoulderY];
  const hipY = -H + 400;
  const hipL: Pt = [-40, hipY];
  const hipR: Pt = [40, hipY];
  const footL: Pt = [-46, 0];
  const footR: Pt = [46, 0];
  const kneeL: Pt = [-44, hipY / 2 - 10];
  const kneeR: Pt = [44, hipY / 2 - 10];

  // Manos en reposo: cuelgan a los lados, casi verticales bajo el hombro.
  const restHandL: Pt = [-84, hipY + 150];
  const restHandR: Pt = [84, hipY + 150];

  // Objetivos de mano (convertimos de coords de lienzo a locales).
  const toLocal = (abs?: Pt): Pt | undefined =>
    abs ? [(abs[0] - cx) / scale, (abs[1] - (groundY + breathe)) / scale] : undefined;
  const handL = toLocal(pose.leftHand) ?? restHandL;
  const handR = toLocal(pose.rightHand) ?? restHandR;

  const elbowL = elbow(shL, handL, +1);
  const elbowR = elbow(shR, handR, -1);

  const limb = (a: Pt, b: Pt, c: Pt, w: number, col: string) => (
    <path
      d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]}`}
      fill="none"
      stroke={col}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );

  const hand = (c: Pt, thumbSide: number) => (
    <g>
      <circle cx={c[0]} cy={c[1]} r={16} fill={p.skin} />
      <circle cx={c[0] + 12 * thumbSide} cy={c[1] - 6} r={7} fill={p.skin} />
    </g>
  );

  const dir = faceLeft ? -1 : 1;

  return (
    <g transform={`translate(${cx}, ${groundY + breathe}) scale(${scale})`}>
      {/* Sombra */}
      <ellipse cx={0} cy={12} rx={150} ry={20} fill={p.line} opacity={0.45} />

      {/* Brazo trasero (derecha del personaje) */}
      {limb(shR, elbowR, handR, 30, p.skin)}
      {hand(handR, +1)}

      {/* Piernas */}
      {limb(hipL, kneeL, footL, 50, p.garmentDark)}
      {limb(hipR, kneeR, footR, 50, p.garmentDark)}
      <ellipse cx={footL[0]} cy={2} rx={30} ry={15} fill={p.ink} />
      <ellipse cx={footR[0]} cy={2} rx={30} ry={15} fill={p.ink} />

      {/* Torso (camisa) con hombros y bajo redondeados */}
      <path
        d={`M${shL[0]} ${shoulderY + 6}
            Q${shL[0] - 6} ${(shoulderY + hipY) / 2} ${hipL[0] - 8} ${hipY}
            Q0 ${hipY + 34} ${hipR[0] + 8} ${hipY}
            Q${shR[0] + 6} ${(shoulderY + hipY) / 2} ${shR[0]} ${shoulderY + 6}
            Q0 ${shoulderY - 30} ${shL[0]} ${shoulderY + 6} Z`}
        fill={p.garment}
      />
      {/* Cuello de la camisa */}
      <path
        d={`M-26 ${shoulderY - 6} L0 ${shoulderY + 26} L26 ${shoulderY - 6}`}
        fill="none"
        stroke={p.garmentDark}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Costura de acento */}
      <line x1={0} y1={shoulderY + 26} x2={0} y2={hipY + 10} stroke={p.accent} strokeWidth={6} strokeLinecap="round" opacity={0.85} />

      {/* Cuello (piel) */}
      <rect x={-18} y={shoulderY - 40} width={36} height={54} rx={16} fill={p.skinShade} />

      {/* ---- Cabeza ---- */}
      <g transform={`rotate(${pose.headTilt ?? 0} ${headC[0]} ${headC[1]})`}>
        {/* Oreja */}
        <circle cx={headC[0] + 52 * dir} cy={headC[1] + 6} r={11} fill={p.skin} />
        {/* Cara */}
        <circle cx={headC[0]} cy={headC[1]} r={headR} fill={p.skin} />
        {/* Mejilla suave */}
        <circle cx={headC[0] + 26 * dir} cy={headC[1] + 20} r={12} fill={p.accent} opacity={0.14} />

        {/* Pelo */}
        {hair === 'bun' ? (
          <>
            <circle cx={headC[0] - 44 * dir} cy={headC[1] - 44} r={20} fill={p.hair} />
            <path d={`M${headC[0] - headR} ${headC[1] - 6} a${headR} ${headR} 0 0 1 ${headR * 2} 0 q-${headR} -54 -${headR * 2} 0 Z`} fill={p.hair} />
          </>
        ) : hair === 'coat-cap' ? (
          <path d={`M${headC[0] - headR} ${headC[1] - 2} a${headR} ${headR} 0 0 1 ${headR * 2} 0 q-${headR} -46 -${headR * 2} 0 Z`} fill={p.hair} />
        ) : (
          <path d={`M${headC[0] - headR} ${headC[1] - 2} a${headR} ${headR} 0 0 1 ${headR * 2} 0 q-${headR} -50 -${headR * 2} 0 Z`} fill={p.hair} />
        )}

        {/* Cejas (expresión) */}
        <Brows expr={expression} c={headC} dir={dir} col={p.hair} />

        {/* Ojos */}
        <g fill={p.ink}>
          <ellipse cx={headC[0] - 20 * dir} cy={headC[1] + 2} rx={5.5} ry={5.5 * eye} />
          <ellipse cx={headC[0] + 20 * dir} cy={headC[1] + 2} rx={5.5} ry={5.5 * eye} />
        </g>

        {/* Gafas opcionales */}
        {glasses ? (
          <g fill="none" stroke={p.ink} strokeWidth={3}>
            <circle cx={headC[0] - 20 * dir} cy={headC[1] + 2} r={14} />
            <circle cx={headC[0] + 20 * dir} cy={headC[1] + 2} r={14} />
            <line x1={headC[0] - 6 * dir} y1={headC[1]} x2={headC[0] + 6 * dir} y2={headC[1]} />
          </g>
        ) : null}

        {/* Nariz */}
        <path d={`M${headC[0] + 2 * dir} ${headC[1] + 8} q6 8 -4 12`} fill="none" stroke={p.skinShade} strokeWidth={3} strokeLinecap="round" />

        {/* Boca (expresión) */}
        <Mouth expr={expression} c={headC} col={p.ink} />
      </g>

      {/* Brazo delantero (izquierda del personaje) */}
      {limb(shL, elbowL, handL, 32, p.skin)}
      {/* Manga sobre el hombro */}
      <circle cx={shL[0]} cy={shoulderY} r={24} fill={p.garment} />
      {hand(handL, -1)}

      {/* Objeto sostenido */}
      {pose.hold ? (
        <g
          transform={`translate(${(pose.hold.hand === 'left' ? handL : handR)[0]}, ${
            (pose.hold.hand === 'left' ? handL : handR)[1]
          }) rotate(${pose.hold.angle ?? 0})`}
        >
          {pose.hold.node}
        </g>
      ) : null}
    </g>
  );
};

const Brows: React.FC<{ expr: Expression; c: Pt; dir: number; col: string }> = ({
  expr,
  c,
  dir,
  col,
}) => {
  const y = c[1] - 20;
  const common = { stroke: col, strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' };
  if (expr === 'worried') {
    return (
      <g {...common}>
        <path d={`M${c[0] - 32 * dir} ${y + 4} q12 -8 22 -2`} />
        <path d={`M${c[0] + 10 * dir} ${y + 2} q10 -6 22 2`} />
      </g>
    );
  }
  if (expr === 'think') {
    return (
      <g {...common}>
        <path d={`M${c[0] - 32 * dir} ${y - 4} q12 -4 22 0`} />
        <path d={`M${c[0] + 10 * dir} ${y} q10 -4 22 0`} />
      </g>
    );
  }
  return (
    <g {...common}>
      <path d={`M${c[0] - 32 * dir} ${y} q12 -6 22 0`} />
      <path d={`M${c[0] + 10 * dir} ${y} q12 -6 22 0`} />
    </g>
  );
};

const Mouth: React.FC<{ expr: Expression; c: Pt; col: string }> = ({ expr, c, col }) => {
  const y = c[1] + 30;
  const common = { fill: 'none', stroke: col, strokeWidth: 4, strokeLinecap: 'round' as const };
  if (expr === 'happy')
    return <path d={`M${c[0] - 18} ${y - 2} q18 22 36 0`} {...common} fill={col} />;
  if (expr === 'smile') return <path d={`M${c[0] - 15} ${y} q15 12 30 0`} {...common} />;
  if (expr === 'worried') return <path d={`M${c[0] - 13} ${y + 4} q13 -10 26 0`} {...common} />;
  if (expr === 'think') return <path d={`M${c[0] - 8} ${y + 2} h18`} {...common} />;
  return <path d={`M${c[0] - 12} ${y + 1} q12 6 24 0`} {...common} />;
};
