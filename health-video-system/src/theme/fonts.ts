/**
 * fonts.ts — carga de las fuentes del sistema vía @remotion/google-fonts.
 *
 * Se importa una sola vez (desde Root.tsx) y expone las familias resueltas.
 * Los nombres lógicos viven en tokens.ts (font.serif / font.sans); aquí se
 * enlazan con las familias reales que devuelve @remotion/google-fonts.
 */
import { loadFont as loadFraunces } from '@remotion/google-fonts/Fraunces';
import { loadFont as loadJost } from '@remotion/google-fonts/Jost';

// Serif de titulares. Pesos usados: 400 / 500 / 600 / 700.
const fraunces = loadFraunces('normal', {
  weights: ['400', '500', '600', '700'],
  // Fraunces es variable; con 'opsz' alto gana elegancia editorial.
});

// Sans geométrica de cuerpo. Pesos usados: 300 / 400 / 500 / 600.
const jost = loadJost('normal', {
  weights: ['300', '400', '500', '600'],
});

/** Familias reales listas para usar en `fontFamily`. */
export const fontFamily = {
  serif: fraunces.fontFamily,
  sans: jost.fontFamily,
} as const;

/** Promesa que resuelve cuando ambas fuentes están disponibles. */
export const fontsReady = Promise.all([
  fraunces.waitUntilDone(),
  jost.waitUntilDone(),
]);

export { fraunces, jost };
