// Configuración de la votación.
// Cambia aquí las tartas, los criterios o el número de votantes.

export const TOTAL_VOTERS = 5

export const CAKES = [
  { id: 'dubai-lotus', name: 'Dubai Lotus', emoji: '🐫', color: '#e9d8c3' },
  { id: 'kinder', name: 'Kinder', emoji: '🍫', color: '#f6dcc8' },
  { id: 'kitkat', name: 'KitKat', emoji: '🍫', color: '#e7d6f0' },
  { id: 'choco-donettes', name: 'Chocolate Blanco y Donettes', emoji: '🍩', color: '#dceaf6' },
]

// weight = peso en la nota final (suman 100)
export const CRITERIA = [
  { id: 'sabor', label: 'Sabor', emoji: '😋', weight: 50 },
  { id: 'textura', label: 'Textura', emoji: '🥄', weight: 30 },
  { id: 'presentacion', label: 'Presentación', emoji: '✨', weight: 20 },
]

export const MIN_SCORE = 1
export const MAX_SCORE = 10
