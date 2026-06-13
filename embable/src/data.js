// ============================================================
//  CONFIGURACIÓN DE LA VOTACIÓN · enbable (taberna asturiana)
//  Cambia aquí los comensales y los platos. Nada más que tocar.
// ============================================================

export const RESTAURANT = {
  name: 'enbable',
  subtitle: 'Taberna Asturiana',
}

// Mientras sea true, se muestra un aviso de "datos de ejemplo".
export const PLACEHOLDER = false

// Escala de puntuación
export const MIN_SCORE = 1
export const MAX_SCORE = 10

// Aspectos a votar (peso igual entre todos)
export const CRITERIA = [
  { id: 'sabor', label: 'Sabor', emoji: '😋' },
  { id: 'presentacion', label: 'Presentación', emoji: '✨' },
  { id: 'originalidad', label: 'Originalidad', emoji: '💡' },
  { id: 'balance', label: 'Balance general', emoji: '⚖️' },
]

// Comensales (cada uno entra y elige su nombre)
export const PEOPLE = [
  { id: 'p1', name: 'Carlos' },
  { id: 'p2', name: 'Carmen' },
  { id: 'p3', name: 'Carla' },
  { id: 'p4', name: 'Sergio' },
  { id: 'p5', name: 'Miguel' },
]

// Platos.
//   scope: 'all'          -> lo votan TODOS (entrantes / para compartir)
//   scope: ['p1','p2']    -> lo votan SOLO esas personas (lo que pidieron)
export const DISHES = [
  { id: 'd1', name: 'Croquetas de jamón', category: 'Entrante', emoji: '🥟', scope: 'all' },
  { id: 'd2', name: 'Fritos de pixín', category: 'Entrante', emoji: '🐟', scope: 'all' },
  { id: 'd3', name: 'Cachopo', category: 'Principal', emoji: '🥩', scope: ['p2', 'p3', 'p4', 'p5'] },
  { id: 'd4', name: 'Chuletillas', category: 'Principal', emoji: '🍖', scope: ['p1', 'p2', 'p3'] },
]
