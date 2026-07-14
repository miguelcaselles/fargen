/**
 * Logo — SVG placeholder. Sustitúyelo por tu logotipo real (mismo tamaño de
 * viewBox recomendado). Monograma minimalista dentro de un círculo: un signo
 * "+" de salud combinado con una línea de datos. Usa tokens de color.
 */
import React from 'react';
import { color } from '../theme/tokens';

export const Logo: React.FC<{ size?: number; tint?: string }> = ({
  size = 120,
  tint = color.accent,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Logo placeholder"
  >
    <circle cx="60" cy="60" r="57" stroke={tint} strokeWidth="3" />
    {/* Cruz de salud */}
    <path
      d="M60 34 V86 M34 60 H86"
      stroke={tint}
      strokeWidth="6"
      strokeLinecap="round"
    />
    {/* Trazo de datos que sube (secundario salvia) */}
    <path
      d="M40 74 L54 62 L64 68 L82 46"
      stroke={color.sage}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);
