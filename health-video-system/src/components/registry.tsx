/**
 * registry.tsx — mapa de `component` (string del guion) → componente React.
 * Añadir un componente nuevo = crearlo, añadir su tipo en schema.ts y
 * registrarlo aquí.
 */
import React from 'react';
import type { Scene } from '../types/schema';
import { AnimatedChart } from './AnimatedChart';
import { BulletReveal } from './BulletReveal';
import { EndCard } from './EndCard';
import { KeyStat } from './KeyStat';
import { ProcessDiagram } from './ProcessDiagram';
import { QuoteCard } from './QuoteCard';
import { TitleCard } from './TitleCard';

/** Renderiza una escena según su `component`, con props tipadas. */
export function renderScene(scene: Scene): React.ReactNode {
  switch (scene.component) {
    case 'TitleCard':
      return <TitleCard {...scene.props} />;
    case 'KeyStat':
      return <KeyStat {...scene.props} />;
    case 'BulletReveal':
      return <BulletReveal {...scene.props} />;
    case 'AnimatedChart':
      return <AnimatedChart {...scene.props} />;
    case 'ProcessDiagram':
      return <ProcessDiagram {...scene.props} />;
    case 'QuoteCard':
      return <QuoteCard {...scene.props} />;
    case 'EndCard':
      return <EndCard {...scene.props} />;
    default: {
      // Exhaustividad: si añades un componente al tipo y olvidas registrarlo,
      // TypeScript marcará error aquí.
      const _exhaustive: never = scene;
      return _exhaustive;
    }
  }
}
