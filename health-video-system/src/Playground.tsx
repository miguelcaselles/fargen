/**
 * Playground — composición auxiliar para previsualizar/validar componentes
 * de forma aislada mientras escribes un guion. NO forma parte del vídeo final.
 *
 * Por defecto muestra AnimatedChart. Puedes cambiar la variante y los datos
 * desde defaultProps en Root.tsx o con --props al renderizar. Los datos aquí
 * son ILUSTRATIVOS (demo del componente), no una estadística real.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AnimatedChart } from './components/AnimatedChart';
import { SafeArea } from './components/SafeArea';
import { color } from './theme/tokens';
import type { AnimatedChartProps } from './types/schema';

export type PlaygroundProps = { chart: AnimatedChartProps };

export const Playground: React.FC<PlaygroundProps> = ({ chart }) => (
  <AbsoluteFill style={{ backgroundColor: color.bg }}>
    <SafeArea align="center" reserveCaption={false}>
      <AnimatedChart {...chart} />
    </SafeArea>
  </AbsoluteFill>
);
