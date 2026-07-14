/**
 * PersonPreview — banco de pruebas del personaje refinado (no es una escena
 * del vídeo). Muestra tres personas: paciente en reposo, paciente inyectándose
 * y farmacéutica con gafas.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { color, illustration as ill } from '../theme/tokens';
import { Person, type Palette } from '../characters/Person';

const patient: Palette = {
  skin: ill.skin,
  skinShade: ill.skinShade,
  hair: ill.hair,
  garment: ill.garment,
  garmentDark: ill.garmentAlt,
  accent: ill.garmentAccent,
  ink: color.ink,
  line: color.line,
};

const pharma: Palette = {
  ...patient,
  garment: ill.coat,
  garmentDark: '#D9D3C6',
  hair: '#4A3B2E',
};

export const PersonPreview: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        {/* Reposo */}
        <Person cx={220} groundY={760} scale={0.62} palette={patient} frame={frame} expression="smile" />
        {/* Inyectándose (mano derecha al vientre, gesto concentrado) */}
        <Person
          cx={560}
          groundY={760}
          scale={0.62}
          palette={patient}
          frame={frame + 20}
          expression="think"
          pose={{
            rightHand: [584, 582],
            hold: {
              hand: 'right',
              angle: 66,
              node: (
                <g>
                  <rect x={-8} y={-6} width={16} height={50} rx={7} fill={color.surface} stroke={color.ink} strokeWidth={3} />
                  <rect x={-8} y={-6} width={16} height={14} rx={7} fill={ill.garmentAccent} />
                </g>
              ),
            },
          }}
        />
        {/* Farmacéutica con gafas, saludando */}
        <Person
          cx={880}
          groundY={760}
          scale={0.62}
          palette={pharma}
          frame={frame + 40}
          expression="happy"
          hair="bun"
          glasses
          pose={{ leftHand: [820, 430], headTilt: -3 }}
        />
      </svg>
    </AbsoluteFill>
  );
};
