/**
 * scenes.tsx — las escenas ILUSTRADAS y animadas del vídeo.
 * Cada escena usa su frame local (va dentro de una <Sequence>). Reutilizan el
 * personaje `Person` y las piezas de parts.tsx. Todo consume tokens.
 *
 * Layout común: rótulo arriba (zona segura), personaje al centro-abajo,
 * subtítulos quemados los pone el contenedor por encima de todo.
 */
import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../theme/fonts';
import { color, type, weight } from '../theme/tokens';
import { Person } from '../characters/Person';
import { enterSpring } from '../components/anim';
import { patientPalette, pharmaPalette } from './palette';
import {
  DataDots,
  DataLine,
  DoseCalendar,
  DrawnCheck,
  HospitalCard,
  InjectorPen,
  Phone,
  SceneLabel,
  SideTable,
  SpeechBubble,
  ThoughtBubble,
} from './parts';

const GROUND = 1360;
const SCALE = 0.86;

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="100%" height="100%" viewBox="0 0 1080 1920">{children}</svg>
);

const labelIn = (frame: number) =>
  interpolate(frame, [6, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

// ---------------------------------------------------------------------------
// 1 · GANCHO — el paciente en casa, mira el inyector con dudas.
// ---------------------------------------------------------------------------
export const SceneGancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bubble = enterSpring(frame, fps, { delay: 46 });
  // Mira el pen (mano derecha a la altura del pecho).
  const raise = enterSpring(frame, fps, { delay: 20 });
  const handY = interpolate(raise, [0, 1], [GROUND - 250, 980]);
  const handX = interpolate(raise, [0, 1], [640, 636]);

  return (
    <Svg>
      <SceneLabel kicker="Adherencia" title={'Empieza en la\nconsulta…'} opacity={labelIn(frame)} />
      <Person
        cx={540}
        groundY={GROUND}
        scale={SCALE}
        palette={patientPalette}
        frame={frame}
        expression={frame > 60 ? 'worried' : 'think'}
        pose={{
          rightHand: [handX, handY],
          headTilt: interpolate(raise, [0, 1], [0, 4]),
          hold: { hand: 'right', angle: interpolate(raise, [0, 1], [10, -8]), node: <InjectorPen /> },
        }}
      />
      <ThoughtBubble x={760} y={760} p={bubble}>
        <text x={-14} y={20} fontFamily={fontFamily.serif} fontSize={64} fontWeight={weight.bold} fill={color.accent}>
          ?
        </text>
      </ThoughtBubble>
    </Svg>
  );
};

// ---------------------------------------------------------------------------
// 2 · PROBLEMA — pasa el tiempo; una dosis se salta y nadie lo ve.
// ---------------------------------------------------------------------------
export const SceneProblema: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cal = interpolate(frame, [24, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const worried = enterSpring(frame, fps, { delay: 150 });

  return (
    <Svg>
      <SceneLabel kicker="El problema" title={'Una dosis se salta\ny nadie lo ve'} opacity={labelIn(frame)} />
      <DoseCalendar x={540} y={780} reveal={cal} missAt={4} />
      {/* Paciente pequeño, preocupado, abajo */}
      <Person
        cx={300}
        groundY={GROUND + 30}
        scale={0.6}
        palette={patientPalette}
        frame={frame}
        expression="worried"
      />
      {/* Hospital desconectado */}
      <g opacity={interpolate(worried, [0, 1], [0.3, 1])}>
        <HospitalCard x={800} y={1120} scale={0.7} dim />
        <text
          x={800}
          y={1250}
          textAnchor="middle"
          fontFamily={fontFamily.sans}
          fontSize={type.label}
          fill={color.inkSoft}
        >
          sin datos
        </text>
      </g>
    </Svg>
  );
};

// ---------------------------------------------------------------------------
// 3 · CÓMO FUNCIONA — se inyecta, el dato viaja, el farmacéutico contacta.
// ---------------------------------------------------------------------------
export const SceneComoFunciona: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Paciente (izquierda) se inyecta.
  const inject = Math.max(0, enterSpring(frame, fps, { delay: 24 }) - enterSpring(frame, fps, { delay: 96 }));
  const phoneActive = frame > 78;

  // Datos y respuesta (del teléfono, arco hasta la farmacéutica).
  const from: [number, number] = [505, 985];
  const ctrl: [number, number] = [650, 880];
  const to: [number, number] = [775, 1150];
  const line = interpolate(frame, [84, 118], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bubble = enterSpring(frame, fps, { delay: 180 });
  const check = interpolate(frame, [196, 214], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const handX = interpolate(inject, [0, 1], [300 + 84, 300 + 44]);
  const handY = interpolate(inject, [0, 1], [GROUND - 250, 1010]);

  return (
    <Svg>
      <SceneLabel kicker="Cómo funciona" title={'El dato viaja\nal equipo'} opacity={labelIn(frame)} />

      {/* Farmacéutica (derecha), saluda suave cuando llegan los datos */}
      <Person
        cx={800}
        groundY={1440}
        scale={0.62}
        palette={pharmaPalette}
        frame={frame + 30}
        hair="bun"
        glasses
        faceLeft
        expression={frame > 190 ? 'happy' : 'smile'}
        pose={{ rightHand: bubble > 0.3 ? [900, 1085] : undefined }}
      />

      {/* Mesita + teléfono del paciente */}
      <SideTable x={470} y={1120} w={120} />
      <Phone x={470} y={1030} active={phoneActive} scale={0.9} />

      {/* Línea + puntos de datos */}
      <DataLine from={from} ctrl={ctrl} to={to} p={line} />
      {phoneActive ? <DataDots from={from} ctrl={ctrl} to={to} frame={frame} start={92} /> : null}

      {/* Paciente inyectándose (izquierda) */}
      <Person
        cx={300}
        groundY={GROUND}
        scale={SCALE}
        palette={patientPalette}
        frame={frame}
        expression="think"
        pose={{
          rightHand: [handX, handY],
          hold: { hand: 'right', angle: 66, node: <InjectorPen /> },
        }}
      />
      {/* Anillo de click */}
      {frame > 80 && frame < 110 ? (
        <circle
          cx={330}
          cy={1030}
          r={interpolate(frame, [80, 106], [6, 44])}
          fill="none"
          stroke={color.accent}
          strokeWidth={4}
          opacity={interpolate(frame, [80, 106], [0.9, 0])}
        />
      ) : null}

      {/* Burbuja de respuesta de la farmacéutica */}
      <SpeechBubble x={905} y={1000} p={bubble} tail="bl" w={132} h={106}>
        <DrawnCheck p={check} size={0.85} />
      </SpeechBubble>
    </Svg>
  );
};

// ---------------------------------------------------------------------------
// 4 · DATO CLAVE — cifra gigante PLACEHOLDER.
// ---------------------------------------------------------------------------
export const SceneDato: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stat = enterSpring(frame, fps, { delay: 16 });
  const labelP = enterSpring(frame, fps, { delay: 40 });
  const point = enterSpring(frame, fps, { delay: 8 });

  return (
    <Svg>
      <SceneLabel kicker="El dato" title={''} opacity={labelIn(frame)} y={340} />
      {/* Cifra placeholder */}
      <g transform={`translate(540, ${760 + interpolate(stat, [0, 1], [24, 0])})`} opacity={stat}>
        <text textAnchor="middle" fontFamily={fontFamily.serif} fontSize={340} fontWeight={weight.semibold} fill={color.ink}>
          <tspan>XX</tspan>
          <tspan fill={color.accent} fontSize={150} dx={6}>%</tspan>
        </text>
      </g>
      <text
        x={540}
        y={980}
        textAnchor="middle"
        fontFamily={fontFamily.sans}
        fontSize={type.subtitle}
        fill={color.inkSoft}
        opacity={labelP}
      >
        <tspan x={540} dy={0}>de las dosis omitidas podrían</tspan>
        <tspan x={540} dy={62}>detectarse a tiempo</tspan>
      </text>
      <text x={540} y={1130} textAnchor="middle" fontFamily={fontFamily.sans} fontSize={type.label} fill={color.inkFaint} opacity={labelP}>
        PLACEHOLDER · dato pendiente de fuente
      </text>
      {/* Paciente pequeño mirando la cifra (sin estirar el brazo) */}
      <g style={{ opacity: interpolate(point, [0, 1], [0, 1]) }}>
        <Person
          cx={905}
          groundY={GROUND + 95}
          scale={0.48}
          palette={patientPalette}
          frame={frame}
          expression="happy"
          faceLeft
          pose={{ headTilt: -6 }}
        />
      </g>
    </Svg>
  );
};

// ---------------------------------------------------------------------------
// 5 · CIERRE — reflexión + nombre/handle/logo, ambos personajes.
// ---------------------------------------------------------------------------
export const SceneCierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const msg = enterSpring(frame, fps, { delay: 10 });
  const wave = Math.sin(frame / 6) * 0.06;
  const nameP = enterSpring(frame, fps, { delay: 60 });

  return (
    <Svg>
      {/* Mensaje de reflexión */}
      <g style={{ opacity: msg }}>
        <text x={540} y={430} textAnchor="middle" fontFamily={fontFamily.serif} fontSize={type.heading} fontWeight={weight.semibold} fill={color.ink}>
          <tspan x={540} dy={0}>¿Y si el mejor momento</tspan>
          <tspan x={540} dy={74}>para ayudar fuese</tspan>
          <tspan x={540} dy={74}>la próxima dosis?</tspan>
        </text>
      </g>

      {/* Logo + nombre / handle (centro) */}
      <g style={{ opacity: nameP }}>
        <g transform="translate(540, 690)">
          <circle cx={0} cy={0} r={34} fill="none" stroke={color.accent} strokeWidth={3} />
          <path d="M0 -16 V16 M-16 0 H16" stroke={color.accent} strokeWidth={5} strokeLinecap="round" />
          <path d="M-11 6 L-3 -1 L3 3 L12 -8" fill="none" stroke={color.sage} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x={540} y={796} textAnchor="middle" fontFamily={fontFamily.sans} fontSize={type.subtitle} fontWeight={weight.semibold} fill={color.ink}>
          Miguel Caselles
        </text>
        <text x={540} y={852} textAnchor="middle" fontFamily={fontFamily.sans} fontSize={type.body} fill={color.accent}>
          @tu_usuario
        </text>
      </g>

      {/* Dos personajes saludando (abajo) */}
      <Person
        cx={400}
        groundY={GROUND + 130}
        scale={0.58}
        palette={patientPalette}
        frame={frame}
        expression="happy"
        pose={{ leftHand: [312, 1180] }}
      />
      <g transform={`rotate(${wave * 20} 700 1200)`}>
        <Person
          cx={700}
          groundY={GROUND + 130}
          scale={0.58}
          palette={pharmaPalette}
          frame={frame + 24}
          hair="bun"
          glasses
          expression="happy"
          faceLeft
          pose={{ rightHand: [788, 1150] }}
        />
      </g>
    </Svg>
  );
};
