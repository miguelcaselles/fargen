/** Paletas de personaje derivadas de los tokens (única fuente de verdad). */
import { color, illustration as ill } from '../theme/tokens';
import type { Palette } from '../characters/Person';

export const patientPalette: Palette = {
  skin: ill.skin,
  skinShade: ill.skinShade,
  hair: ill.hair,
  garment: ill.garment,
  garmentDark: ill.garmentAlt,
  accent: ill.garmentAccent,
  ink: color.ink,
  line: color.line,
};

export const pharmaPalette: Palette = {
  ...patientPalette,
  garment: ill.coat,
  garmentDark: '#D9D3C6',
  hair: '#4A3B2E',
};
