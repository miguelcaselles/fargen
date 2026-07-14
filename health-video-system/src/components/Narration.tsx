/**
 * Narration — carga la locución (mp3) desde public/audio/ y la reproduce
 * sincronizada con el vídeo. Los subtítulos se sincronizan aparte, desde el
 * archivo de timings (ver Subtitles).
 *
 * El placeholder es un silencio (public/audio/silence.mp3). Sustitúyelo por
 * tu locución de ElevenLabs manteniendo el mismo nombre, o cambia meta.audio
 * en el guion. Ver README.
 */
import React from 'react';
import { Audio, staticFile } from 'remotion';

export const Narration: React.FC<{
  /** Nombre del archivo dentro de public/audio/ (p.ej. "narracion.mp3"). */
  src?: string;
  /** Volumen 0-1. */
  volume?: number;
}> = ({ src, volume = 1 }) => {
  if (!src) return null;
  return <Audio src={staticFile(`audio/${src}`)} volume={volume} />;
};
