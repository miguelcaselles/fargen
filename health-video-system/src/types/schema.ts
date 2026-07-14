/**
 * schema.ts — Esquema tipado del GUION.
 *
 * Un vídeo = un archivo JSON en src/scripts/<nombre>.json.
 * El JSON es un objeto {meta, scenes}. Cada escena declara:
 *   - `component`: qué componente reutilizable la renderiza
 *   - `durationInFrames`: cuánto dura (a 30 fps)
 *   - `props`: las propiedades tipadas de ese componente
 *
 * Para un vídeo nuevo NO tocas el diseño: solo escribes otro JSON.
 */

// ---------------------------------------------------------------------------
// Props de cada componente
// ---------------------------------------------------------------------------

export type TitleCardProps = {
  /** Antetítulo corto en versalitas (opcional). */
  kicker?: string;
  /** Titular grande (serif). */
  title: string;
  /** Subtítulo de apoyo (sans). */
  subtitle?: string;
};

export type KeyStatProps = {
  /** Antetítulo corto. */
  kicker?: string;
  /**
   * Valor a mostrar. Si es número, cuenta hacia arriba desde `from`.
   * Si es string (p.ej. "XX %" PLACEHOLDER), se muestra tal cual sin contar.
   */
  value: number | string;
  /** Valor inicial del conteo (por defecto 0). */
  from?: number;
  /** Prefijo pegado a la cifra (p.ej. "€"). */
  prefix?: string;
  /** Sufijo pegado a la cifra (p.ej. "%", "x"). */
  suffix?: string;
  /** Decimales al contar (por defecto 0). */
  decimals?: number;
  /** Etiqueta descriptiva bajo la cifra. */
  label: string;
  /** Nota al pie / fuente (opcional). */
  footnote?: string;
};

export type BulletRevealProps = {
  kicker?: string;
  title?: string;
  /** 3-4 ideas. Aparecen escalonadas, separadas por filetes finos. */
  items: string[];
};

export type ChartDatum = { label: string; value: number };

export type AnimatedChartProps = {
  kicker?: string;
  title?: string;
  /** Tipo de gráfica. */
  variant: 'bars' | 'line';
  /** Series de datos. Ordenadas como se quieren mostrar. */
  data: ChartDatum[];
  /** Sufijo del eje/valor (p.ej. "%"). */
  unit?: string;
  /** Nota al pie / fuente. */
  footnote?: string;
};

export type ProcessStep = {
  /** Título corto del paso. */
  title: string;
  /** Descripción opcional de una línea. */
  detail?: string;
};

export type ProcessDiagramProps = {
  kicker?: string;
  title?: string;
  /** 3-5 pasos encadenados con conectores que se trazan. */
  steps: ProcessStep[];
};

export type QuoteCardProps = {
  /** La frase destacada. */
  quote: string;
  /** Atribución opcional. */
  attribution?: string;
};

export type EndCardProps = {
  /** Nombre a mostrar. */
  name: string;
  /** Handle (p.ej. "@miguel"). */
  handle: string;
  /** Llamada a la reflexión / cierre. */
  message?: string;
};

// ---------------------------------------------------------------------------
// Unión discriminada de escenas
// ---------------------------------------------------------------------------

/** Campos comunes a toda escena. */
type SceneBase = {
  /** Duración en frames (a 30 fps). Recomendado 120-240 (4-8 s). */
  durationInFrames: number;
  /** Identificador legible (aparece en Remotion Studio). */
  id?: string;
};

export type Scene =
  | (SceneBase & { component: 'TitleCard'; props: TitleCardProps })
  | (SceneBase & { component: 'KeyStat'; props: KeyStatProps })
  | (SceneBase & { component: 'BulletReveal'; props: BulletRevealProps })
  | (SceneBase & { component: 'AnimatedChart'; props: AnimatedChartProps })
  | (SceneBase & { component: 'ProcessDiagram'; props: ProcessDiagramProps })
  | (SceneBase & { component: 'QuoteCard'; props: QuoteCardProps })
  | (SceneBase & { component: 'EndCard'; props: EndCardProps });

export type SceneComponent = Scene['component'];

// ---------------------------------------------------------------------------
// Subtítulos (timings)
// ---------------------------------------------------------------------------

/** Una palabra con sus tiempos en SEGUNDOS. */
export type SubtitleWord = { text: string; start: number; end: number };

/** Una línea/frase de subtítulo (grupo corto de palabras). */
export type SubtitleLine = { words: SubtitleWord[] };

/** Pista completa de subtítulos: vive en src/scripts/<nombre>.timings.json */
export type SubtitleTrack = { lines: SubtitleLine[] };

/** Metadatos del guion. */
export type ScriptMeta = {
  /** Título interno del vídeo. */
  title: string;
  /** Nombre del archivo de audio en public/audio/ (opcional). */
  audio?: string;
  /** Nombre del archivo de timings de subtítulos (opcional). */
  timings?: string;
};

/** Guion completo. */
export type VideoScript = {
  meta: ScriptMeta;
  scenes: Scene[];
};

// ---------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------

/** Suma total de frames de un guion. */
export function totalFrames(script: VideoScript): number {
  return script.scenes.reduce((acc, s) => acc + s.durationInFrames, 0);
}

/**
 * Valida el guion. Lanza si algo no cuadra.
 * @param script guion a validar
 * @param expectedTotal si se pasa, exige que las duraciones sumen exactamente
 *   este total (para detectar desajustes con la composición).
 */
export function validateScript(
  script: VideoScript,
  expectedTotal?: number,
): number {
  if (!script.scenes || script.scenes.length === 0) {
    throw new Error('[schema] El guion no tiene escenas.');
  }

  script.scenes.forEach((s, i) => {
    if (!Number.isInteger(s.durationInFrames) || s.durationInFrames <= 0) {
      throw new Error(
        `[schema] Escena ${i} (${s.component}): durationInFrames debe ser un entero > 0.`,
      );
    }
  });

  const total = totalFrames(script);

  if (expectedTotal !== undefined && total !== expectedTotal) {
    throw new Error(
      `[schema] La suma de duraciones (${total} frames) no coincide con la ` +
        `duración total esperada (${expectedTotal} frames). ` +
        `Ajusta las escenas o la composición.`,
    );
  }

  return total;
}
