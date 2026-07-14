/**
 * HomeInjectionScene — ESCENA DE PRUEBA de animación ilustrada.
 *
 * Un paciente (personaje 2D plano articulado) se administra un inyectable en
 * casa: respira, parpadea, sube el brazo, se pone la inyección (pulso de
 * "click") y el dato viaja por una línea de puntos hasta el farmacéutico, que
 * responde con un check. Todo dibujado por código, estilo japandi.
 *
 * Objetivo: validar la DIRECCIÓN (personaje que se mueve) antes de rehacer el
 * vídeo entero con esta técnica.
 */
import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fontFamily } from '../theme/fonts';
import { color, illustration as ill, type, weight } from '../theme/tokens';
import { drawProgress, enterSpring } from '../components/anim';

// ---- helpers -------------------------------------------------------------
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Punto sobre una Bézier cuadrática P0-C-P1 en u∈[0,1]. */
function quad(
  p0: [number, number],
  c: [number, number],
  p1: [number, number],
  u: number,
): [number, number] {
  const mu = 1 - u;
  const x = mu * mu * p0[0] + 2 * mu * u * c[0] + u * u * p1[0];
  const y = mu * mu * p0[1] + 2 * mu * u * c[1] + u * u * p1[1];
  return [x, y];
}

/** Parpadeo: 1 = ojo abierto, 0 = cerrado. Cierra brevemente en varios frames. */
function blink(frame: number): number {
  const blinks = [46, 132, 208];
  let v = 1;
  for (const b of blinks) {
    const d = Math.abs(frame - b);
    if (d < 4) v = Math.min(v, d / 4);
  }
  return v;
}

// Geometría de la línea de datos (teléfono → farmacéutico)
const PHONE_TOP: [number, number] = [742, 1092];
const LINK_CTRL: [number, number] = [660, 800];
const PHARM_CHEST: [number, number] = [560, 560];

export const HomeInjectionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrada global suave.
  const appear = enterSpring(frame, fps, { delay: 0 });

  // Respiración (sutil, cíclica).
  const breathe = Math.sin(frame / 15) * 4;

  // Brazo hacia el vientre (0 = colgando, 1 = inyectando) y vuelta.
  const up = enterSpring(frame, fps, { delay: 28 }); // sube
  const down = enterSpring(frame, fps, { delay: 108 }); // baja de nuevo
  const armT = Math.max(0, up - down);

  // Joints del brazo delantero (interpolados por armT).
  const shoulderF: [number, number] = [472, 1008];
  const elbow: [number, number] = [
    lerp(452, 484, armT),
    lerp(1120, 1074, armT),
  ];
  const hand: [number, number] = [
    lerp(450, 548, armT),
    lerp(1232, 1118, armT),
  ];

  // "Click" de la inyección: anillo que se expande y desvanece tras subir.
  const clickStart = 74;
  const clickP = interpolate(frame, [clickStart, clickStart + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const injected = frame >= clickStart;

  // Dots de datos: emitidos tras la inyección, viajan por la línea.
  const dotsStart = clickStart + 6;
  const dotCount = 5;

  // Línea de datos "dibujándose".
  const linkDraw = drawProgress(frame, { delay: dotsStart, length: 24 });

  // Respuesta del farmacéutico (burbuja con check) cuando llegan los datos.
  const bubbleP = enterSpring(frame, fps, { delay: 176 });
  const checkP = drawProgress(frame, { delay: 188, length: 16 });

  const eye = blink(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1080 1920"
        style={{ opacity: appear }}
      >
        {/* ================= FARMACÉUTICO (arriba, tras el mostrador) ===== */}
        <g transform={`translate(0, ${interpolate(appear, [0, 1], [-20, 0])})`}>
          {/* Cabeza */}
          <circle cx={540} cy={452} r={50} fill={ill.skin} />
          {/* Pelo */}
          <path
            d="M492 448 a48 48 0 0 1 96 0 q-48 -34 -96 0 Z"
            fill={ill.hair}
          />
          {/* Ojos */}
          <g fill={ill.hair}>
            <ellipse cx={524} cy={452} rx={4} ry={4 * eye} />
            <ellipse cx={556} cy={452} rx={4} ry={4 * eye} />
          </g>
          {/* Hombros / bata */}
          <path
            d="M470 560 q70 -70 140 0 v40 h-140 Z"
            fill={ill.coat}
            stroke={color.line}
            strokeWidth={2}
          />
          {/* Cuello de la bata */}
          <path d="M528 512 l12 24 l12 -24 Z" fill={color.bgSunken} />
          {/* Cruz / badge */}
          <g stroke={color.accent} strokeWidth={6} strokeLinecap="round">
            <line x1={540} y1={548} x2={540} y2={572} />
            <line x1={528} y1={560} x2={552} y2={560} />
          </g>
          {/* Mostrador */}
          <rect x={330} y={598} width={420} height={64} rx={14} fill={ill.coat} stroke={color.line} strokeWidth={2} />
          <rect x={330} y={598} width={420} height={10} rx={5} fill={ill.garmentAccent} />
        </g>

        {/* Burbuja de respuesta con check */}
        <g
          transform={`translate(700, 430) scale(${bubbleP})`}
          style={{ transformBox: 'fill-box', transformOrigin: '0 100%' }}
        >
          <rect x={-6} y={-56} width={132} height={112} rx={28} fill={color.surface} stroke={color.line} strokeWidth={2} />
          <path d="M8 44 l18 26 l-4 -26 Z" fill={color.surface} stroke={color.line} strokeWidth={2} />
          <path
            d="M30 4 l22 26 l40 -50"
            fill="none"
            stroke={color.sage}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - checkP}
          />
        </g>

        {/* ================= LÍNEA DE DATOS ============================== */}
        <DataLink linkDraw={linkDraw} />
        {injected
          ? Array.from({ length: dotCount }).map((_, i) => {
              const local = frame - (dotsStart + i * 14);
              const u = interpolate(local, [0, 46], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              if (local < 0 || u >= 1) return null;
              const [x, y] = quad(PHONE_TOP, LINK_CTRL, PHARM_CHEST, u);
              const o = interpolate(u, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);
              return <circle key={i} cx={x} cy={y} r={8} fill={color.accent} opacity={o} />;
            })
          : null}

        {/* ================= MESA + TELÉFONO ============================= */}
        <g>
          <rect x={690} y={1150} width={110} height={16} rx={8} fill={ill.garmentAlt} />
          <rect x={700} y={1166} width={12} height={150} rx={6} fill={ill.garmentAlt} />
          <rect x={778} y={1166} width={12} height={150} rx={6} fill={ill.garmentAlt} />
          {/* Teléfono */}
          <rect x={716} y={1092} width={54} height={100} rx={12} fill={color.ink} />
          <rect x={722} y={1100} width={42} height={84} rx={7} fill={color.surface} />
          {/* Pulso en pantalla */}
          <path
            d="M726 1150 l8 0 l6 -18 l8 30 l6 -12 l6 0"
            fill="none"
            stroke={injected ? color.accent : color.line}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ================= PACIENTE ==================================== */}
        <g transform={`translate(0, ${breathe})`}>
          {/* Sombra en el suelo */}
          <ellipse cx={540} cy={1476} rx={150} ry={22} fill={color.line} opacity={0.5} />

          {/* Brazo trasero */}
          <Limb a={[608, 1012]} b={[632, 1112]} c={[636, 1208]} w={30} color={ill.skin} />

          {/* Piernas */}
          <Limb a={[514, 1206]} b={[502, 1332]} c={[498, 1452]} w={52} color={ill.garmentAlt} />
          <Limb a={[566, 1206]} b={[580, 1332]} c={[586, 1452]} w={52} color={ill.garmentAlt} />
          {/* Pies */}
          <ellipse cx={492} cy={1462} rx={30} ry={16} fill={color.ink} />
          <ellipse cx={592} cy={1462} rx={30} ry={16} fill={color.ink} />

          {/* Torso (prenda) */}
          <rect x={456} y={982} width={168} height={236} rx={64} fill={ill.garment} />
          {/* Detalle terracota (cremallera/costura) */}
          <rect x={536} y={1000} width={8} height={196} rx={4} fill={ill.garmentAccent} opacity={0.85} />

          {/* Cuello */}
          <rect x={520} y={930} width={40} height={70} rx={18} fill={ill.skin} />

          {/* Cabeza */}
          <circle cx={540} cy={892} r={72} fill={ill.skin} />
          {/* Pelo */}
          <path d="M470 884 a70 70 0 0 1 140 0 q-70 -46 -140 0 Z" fill={ill.hair} />
          {/* Ojos */}
          <g fill={ill.hair}>
            <ellipse cx={518} cy={892} rx={6} ry={6 * eye} />
            <ellipse cx={562} cy={892} rx={6} ry={6 * eye} />
          </g>
          {/* Boca */}
          <path d="M524 918 q16 12 32 0" fill="none" stroke={ill.hair} strokeWidth={4} strokeLinecap="round" />

          {/* Anillo de "click" en el punto de inyección */}
          {injected ? (
            <circle
              cx={548}
              cy={1128}
              r={interpolate(clickP, [0, 1], [6, 46])}
              fill="none"
              stroke={color.accent}
              strokeWidth={4}
              opacity={interpolate(clickP, [0, 1], [0.9, 0])}
            />
          ) : null}

          {/* Brazo delantero (se anima hacia el vientre) */}
          <Limb a={shoulderF} b={elbow} c={hand} w={32} color={ill.skin} />
          {/* Manga sobre el hombro delantero */}
          <circle cx={shoulderF[0]} cy={shoulderF[1]} r={26} fill={ill.garment} />

          {/* Inyector (pen) en la mano */}
          <g
            transform={`translate(${hand[0]}, ${hand[1]}) rotate(${lerp(10, 62, armT)})`}
          >
            <rect x={-8} y={-6} width={16} height={54} rx={7} fill={color.surface} stroke={color.ink} strokeWidth={3} />
            <rect x={-8} y={-6} width={16} height={16} rx={7} fill={ill.garmentAccent} />
            <rect x={-3} y={46} width={6} height={12} rx={3} fill={color.inkSoft} />
          </g>
        </g>

        {/* ================= RÓTULO ====================================== */}
        <g style={{ opacity: interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <text
            x={96}
            y={1600}
            fontFamily={fontFamily.serif}
            fontSize={type.heading}
            fontWeight={weight.semibold}
            fill={color.ink}
          >
            En casa, sin perder el hilo
          </text>
          <text
            x={96}
            y={1660}
            fontFamily={fontFamily.sans}
            fontSize={type.body}
            fill={color.inkSoft}
          >
            Cada dosis viaja al equipo en tiempo real.
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Extremidad de 2 segmentos dibujada como trazo grueso con juntas redondas. */
const Limb: React.FC<{
  a: [number, number];
  b: [number, number];
  c: [number, number];
  w: number;
  color: string;
}> = ({ a, b, c, w, color }) => (
  <>
    <path
      d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]}`}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Mano/pie redondeado al final */}
    <circle cx={c[0]} cy={c[1]} r={w * 0.55} fill={color} />
  </>
);

/** Línea de datos punteada que se "dibuja". */
const DataLink: React.FC<{ linkDraw: number }> = ({ linkDraw }) => {
  const d = `M${PHONE_TOP[0]} ${PHONE_TOP[1]} Q${LINK_CTRL[0]} ${LINK_CTRL[1]} ${PHARM_CHEST[0]} ${PHARM_CHEST[1]}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={color.line}
      strokeWidth={3}
      strokeDasharray="2 16"
      strokeLinecap="round"
      opacity={0.9 * linkDraw}
    />
  );
};
