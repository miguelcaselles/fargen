// ============================================================
//  CONFIGURACIÓN DE LA VOTACIÓN · enbable (taberna asturiana)
//  Cambia aquí los comensales y los platos. Nada más que tocar.
// ============================================================

export const RESTAURANT = {
  name: 'enbable',
  subtitle: 'Taberna Asturiana',
}

// Mientras sea true, se muestra un aviso de "datos de ejemplo".
export const PLACEHOLDER = true

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
  { id: 'p1', name: 'Comensal 1' },
  { id: 'p2', name: 'Comensal 2' },
  { id: 'p3', name: 'Comensal 3' },
  { id: 'p4', name: 'Comensal 4' },
]

// Platos.
//   scope: 'all'          -> lo votan TODOS (entrantes / para compartir)
//   scope: ['p1','p2']    -> lo votan SOLO esas personas (lo que pidieron)
export const DISHES = [
  { id: 'd1', name: 'Tabla de quesos asturianos', category: 'Entrante', emoji: '🧀', scope: 'all' },
  { id: 'd2', name: 'Croquetas de cabrales', category: 'Entrante', emoji: '🥟', scope: 'all' },
  { id: 'd3', name: 'Chorizo a la sidra', category: 'Entrante', emoji: '🌭', scope: 'all' },
  { id: 'd4', name: 'Fabada asturiana', category: 'Principal', emoji: '🫘', scope: ['p1', 'p2'] },
  { id: 'd5', name: 'Cachopo', category: 'Principal', emoji: '🥩', scope: ['p3'] },
  { id: 'd6', name: 'Pixín a la plancha', category: 'Principal', emoji: '🐟', scope: ['p4'] },
  { id: 'd7', name: 'Arroz con leche', category: 'Postre', emoji: '🍮', scope: 'all' },
]
