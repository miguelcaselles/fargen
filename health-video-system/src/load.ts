/**
 * load.ts — carga y valida el guion activo + su pista de subtítulos.
 *
 * PARA UN VÍDEO NUEVO: crea src/scripts/<nombre>.json (+ .timings.json) y
 * cambia estas dos importaciones. Nada más.
 */
import scriptJson from './scripts/adherencia-hipolipemiantes.json';
import timingsJson from './scripts/adherencia-hipolipemiantes.timings.json';
import {
  validateScript,
  type SubtitleTrack,
  type VideoScript,
} from './types/schema';

export const script = scriptJson as VideoScript;
export const track = timingsJson as SubtitleTrack;

// Valida el guion y calcula la duración total (suma de escenas).
// Si algo no cuadra, lanza aquí (visible en Studio y en el render).
export const durationInFrames = validateScript(script);
