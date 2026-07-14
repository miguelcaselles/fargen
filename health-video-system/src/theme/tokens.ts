/**
 * tokens.ts — ÚNICA FUENTE DE VERDAD del sistema de diseño.
 *
 * Estética: japandi / minimalista escandinavo-japonés.
 * Cambia aquí y cambia en todo el vídeo. Ningún componente debe hardcodear
 * un color, un tamaño o una duración: todo sale de este archivo.
 *
 * Formato de salida: 1080 x 1920 (vertical), 30 fps.
 */

// ---------------------------------------------------------------------------
// LIENZO
// ---------------------------------------------------------------------------
export const canvas = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/**
 * ZONAS SEGURAS (Reels / TikTok / Shorts)
 * La UI de la app se superpone arriba y abajo. Nada de contenido crítico
 * (texto, cifras, subtítulos) debe entrar en estas bandas.
 *   - 220 px arriba  (avatar, seguir, sonido)
 *   - 340 px abajo   (caption, botones de interacción, barra de progreso)
 * Se aplica con el componente <SafeArea>.
 */
export const safeArea = {
  top: 220,
  bottom: 340,
  // Márgenes laterales cómodos, coherentes con el "mucho aire" japandi.
  left: 96,
  right: 96,
  /**
   * Banda inferior reservada para los subtítulos quemados. El contenido de
   * cada escena se mantiene por encima de esta franja para que nunca choque
   * con los subtítulos (que se dibujan como capa superior).
   */
  captionBand: 210,
} as const;

// ---------------------------------------------------------------------------
// COLOR — paleta japandi (validada)
// Jerarquía por tamaño y peso, NO por color. Un solo acento.
// ---------------------------------------------------------------------------
export const color = {
  /** Fondo hueso / crema muy claro. */
  bg: '#F5F1E8',
  /** Variante ligeramente más profunda para bloques/paneles sutiles. */
  bgSunken: '#EEE9DC',
  /** Tinta casi negra pero cálida: titulares y cuerpo. */
  ink: '#29251F',
  /** Tinta atenuada: etiquetas, subtítulos secundarios, metadatos. */
  inkSoft: '#6B6459',
  /** Tinta muy tenue: pies, marcas de agua. */
  inkFaint: '#A79F92',
  /** ÚNICO color de acento: terracota apagado. */
  accent: '#C06A4B',
  /** Secundario neutro: verde salvia. */
  sage: '#93A585',
  /** Filete fino / rejilla / conectores. */
  line: '#DAD3C6',
  /** Blanco cálido para superficies elevadas puntuales. */
  surface: '#FBF9F3',
} as const;

/**
 * Paleta de ILUSTRACIÓN para los personajes animados. Extiende la paleta
 * japandi con tonos de piel y ropa cálidos y apagados, coherentes con el resto.
 */
export const illustration = {
  /** Piel cálida neutra. */
  skin: '#E7C4A0',
  /** Sombra suave de la piel. */
  skinShade: '#D9AE86',
  /** Cabello / rasgos: tinta. */
  hair: '#29251F',
  /** Bata / camisa del farmacéutico (crema elevado). */
  coat: '#FBF9F3',
  /** Prenda principal del paciente (salvia). */
  garment: '#93A585',
  /** Prenda alternativa / pantalón (tinta suave). */
  garmentAlt: '#6B6459',
  /** Acento textil (terracota). */
  garmentAccent: '#C06A4B',
} as const;

// ---------------------------------------------------------------------------
// TIPOGRAFÍA
// Titulares en serif elegante (Fraunces). Cuerpo en sans geométrica (Jost).
// Las familias reales se resuelven en theme/fonts.ts vía @remotion/google-fonts.
// ---------------------------------------------------------------------------
export const font = {
  /** Serif de titulares. */
  serif: 'Fraunces',
  /** Sans geométrica de cuerpo. */
  sans: 'Jost',
} as const;

/** Escala tipográfica en px (pensada para 1080x1920). */
export const type = {
  /** Cifra gigante del KeyStat. */
  stat: 320,
  /** Display / gancho a toda página. */
  display: 128,
  /** Titular principal de escena. */
  title: 92,
  /** Titular secundario / pasos. */
  heading: 64,
  /** Subtítulo de apoyo. */
  subtitle: 48,
  /** Cuerpo de texto. */
  body: 40,
  /** Etiqueta / label / eje. */
  label: 32,
  /** Kicker (antetítulo en versalitas). */
  kicker: 28,
  /** Subtítulos quemados (word-by-word). */
  caption: 54,
} as const;

/** Pesos disponibles (deben coincidir con los cargados en fonts.ts). */
export const weight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Interlineado relativo. */
export const leading = {
  tight: 1.02,
  snug: 1.12,
  normal: 1.32,
  relaxed: 1.5,
} as const;

/** Tracking (letter-spacing) en em. */
export const tracking = {
  tight: '-0.02em',
  normal: '0em',
  wide: '0.02em',
  /** Para kickers en versalitas. */
  kicker: '0.22em',
} as const;

// ---------------------------------------------------------------------------
// ESPACIADO — base 8. Mucho aire.
// ---------------------------------------------------------------------------
export const space = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
  '3xl': 96,
  '4xl': 128,
} as const;

// ---------------------------------------------------------------------------
// RADIOS — suaves, minimalistas. Nada de burbujas.
// ---------------------------------------------------------------------------
export const radius = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/** Grosor de los filetes finos característicos. */
export const stroke = {
  hair: 2,
  thin: 3,
  regular: 4,
} as const;

// ---------------------------------------------------------------------------
// SOMBRA — casi imperceptible, difusa. Nunca dura.
// ---------------------------------------------------------------------------
export const shadow = {
  none: 'none',
  soft: '0 24px 60px rgba(41, 37, 31, 0.06)',
} as const;

// ---------------------------------------------------------------------------
// MOVIMIENTO
// Entradas suaves con spring y ease-out, fades y desplazamientos cortos.
// Prohibido: flashes, zooms bruscos, rebotes cómicos, glitch, partículas.
// ---------------------------------------------------------------------------

/** Duraciones en frames (a 30 fps). */
export const duration = {
  /** ~0.27 s */
  fast: 8,
  /** ~0.4 s */
  base: 12,
  /** ~0.6 s */
  slow: 18,
  /** ~0.9 s — trazados, dibujos progresivos. */
  draw: 27,
  /** Fade de cruce entre escenas (~0.5 s). */
  crossfade: 15,
  /** Escalonado entre elementos de una lista. */
  stagger: 7,
} as const;

/**
 * Curvas de easing (cubic-bezier) para interpolaciones que NO usan spring.
 * Todas ease-out o ease-in-out suaves. Sin overshoot.
 */
export const easing = {
  /** Salida suave estándar. */
  out: [0.22, 1, 0.36, 1] as const,
  /** Entrada+salida equilibrada. */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Salida muy suave para fades largos. */
  gentle: [0.33, 0, 0.15, 1] as const,
} as const;

/**
 * Configuraciones de spring reutilizables. Sin rebote (sin overshoot):
 * damping alto + overshootClamping para el look calmado japandi.
 */
export const spring = {
  /** Entrada estándar de un elemento. */
  soft: { damping: 200, mass: 1, stiffness: 100, overshootClamping: true },
  /** Un poco más de recorrido/energía, aún sin rebote. */
  gentle: { damping: 26, mass: 0.9, stiffness: 90, overshootClamping: true },
} as const;

/** Desplazamientos de entrada (px). Cortos, discretos. */
export const shift = {
  sm: 24,
  md: 40,
} as const;

// ---------------------------------------------------------------------------
// Agregado por comodidad de importación: `import { tokens } from ...`
// ---------------------------------------------------------------------------
export const tokens = {
  canvas,
  safeArea,
  color,
  font,
  type,
  weight,
  leading,
  tracking,
  space,
  radius,
  stroke,
  shadow,
  duration,
  easing,
  spring,
  shift,
} as const;

export type Tokens = typeof tokens;
export default tokens;
