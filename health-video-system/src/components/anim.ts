/**
 * anim.ts — utilidades de animación compartidas.
 *
 * Centraliza el "vocabulario de movimiento" del sistema para que todos los
 * componentes entren igual: spring suave, fade y desplazamiento corto.
 * Nada de flashes, zooms, rebotes ni glitch.
 */
import { interpolate, spring as remotionSpring } from 'remotion';
import { duration, easing, shift, spring } from '../theme/tokens';

type Bezier = readonly [number, number, number, number];

/**
 * Progreso de entrada 0→1 con spring suave (sin rebote).
 */
export function enterSpring(
  frame: number,
  fps: number,
  opts?: { delay?: number; config?: typeof spring.soft },
): number {
  return remotionSpring({
    frame: frame - (opts?.delay ?? 0),
    fps,
    config: opts?.config ?? spring.soft,
  });
}

/**
 * Estilo de entrada estándar: fade + desplazamiento vertical corto hacia
 * arriba. Devuelve `{ opacity, transform }` listo para el style.
 */
export function fadeUp(
  frame: number,
  fps: number,
  opts?: { delay?: number; distance?: number; config?: typeof spring.soft },
): { opacity: number; transform: string } {
  const p = enterSpring(frame, fps, {
    delay: opts?.delay ?? 0,
    config: opts?.config,
  });
  const distance = opts?.distance ?? shift.md;
  const y = interpolate(p, [0, 1], [distance, 0]);
  return {
    opacity: p,
    transform: `translateY(${y}px)`,
  };
}

/**
 * Fade simple por interpolación con easing (para cruces y apariciones sin
 * desplazamiento). `frame` relativo al inicio del elemento.
 */
export function fadeIn(
  frame: number,
  opts?: { delay?: number; length?: number; curve?: Bezier },
): number {
  const delay = opts?.delay ?? 0;
  const length = opts?.length ?? duration.base;
  return interpolate(frame, [delay, delay + length], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => bezier(opts?.curve ?? easing.out, t),
  });
}

/**
 * Progreso 0→1 de un "trazado" (dibujo de línea/barra) con ease-out.
 */
export function drawProgress(
  frame: number,
  opts?: { delay?: number; length?: number; curve?: Bezier },
): number {
  const delay = opts?.delay ?? 0;
  const length = opts?.length ?? duration.draw;
  return interpolate(frame, [delay, delay + length], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => bezier(opts?.curve ?? easing.out, t),
  });
}

/**
 * Evaluación de una curva cubic-bezier en t∈[0,1] (aproximación Newton).
 * Remotion acepta funciones de easing (t)=>number en interpolate.
 */
export function bezier(c: Bezier, t: number): number {
  const [x1, y1, x2, y2] = c;
  // Resolver x(u)=t para u, luego devolver y(u).
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  let u = t;
  for (let i = 0; i < 5; i++) {
    const x = sampleX(u) - t;
    const dx = sampleDX(u);
    if (Math.abs(x) < 1e-4 || Math.abs(dx) < 1e-6) break;
    u -= x / dx;
  }
  u = Math.min(1, Math.max(0, u));
  return sampleY(u);
}
