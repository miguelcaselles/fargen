/**
 * Root.tsx — registra las composiciones de Remotion.
 * Carga las fuentes (efecto lateral) y define la composición "Video", cuya
 * duración sale del guion (suma de escenas).
 */
import React from 'react';
import { Composition } from 'remotion';
import './theme/fonts'; // carga Fraunces + Jost
import { canvas } from './theme/tokens';
import { Video } from './Video';
import { Playground } from './Playground';
import { HomeInjectionScene } from './scenes/HomeInjectionScene';
import { PersonPreview } from './scenes/PersonPreview';
import { AnimatedVideo, ANIM_TOTAL } from './anim-video/AnimatedVideo';
import { durationInFrames, script, track } from './load';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vídeo real, montado desde el guion JSON. */}
      <Composition
        id="Video"
        component={Video}
        durationInFrames={durationInFrames}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{
          script,
          track,
          showSafeGuides: false,
        }}
      />

      {/* Auxiliar: previsualizar AnimatedChart (datos ilustrativos). */}
      <Composition
        id="Playground"
        component={Playground}
        durationInFrames={150}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{
          chart: {
            kicker: 'Demo',
            title: 'Gráfica de barras',
            variant: 'bars',
            unit: '',
            data: [
              { label: 'A', value: 3 },
              { label: 'B', value: 5 },
              { label: 'C', value: 8 },
              { label: 'D', value: 6 },
            ],
            footnote: 'Datos ilustrativos · demo de componente',
          },
        }}
      />

      {/* PRUEBA de dirección: escena ilustrada con personaje animado. */}
      <Composition
        id="EscenaAnimada"
        component={HomeInjectionScene}
        durationInFrames={240}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
      />

      {/* Banco de pruebas del personaje refinado. */}
      <Composition
        id="PersonPreview"
        component={PersonPreview}
        durationInFrames={120}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
      />

      {/* VÍDEO COMPLETO con personajes ilustrados animados. */}
      <Composition
        id="VideoAnimado"
        component={AnimatedVideo}
        durationInFrames={ANIM_TOTAL}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
      />
    </>
  );
};
