# 🧀 Votación de Tartas de Queso

App web (React + Vite) para una cata a ciegas de 4 tartas de queso:
**Dubai Lotus**, **Kinder**, **KitKat** y **Chocolate Blanco y Donettes**.

- Cada persona pone su nombre y puntúa cada tarta del **1 al 10** en 4 criterios:
  Presentación, Textura, Sabor y Originalidad.
- Votan **5 personas**. Cuando todas han votado se desbloquean los resultados:
  podio 🥇🥈🥉, clasificación completa y estadísticas detalladas por criterio.
- Diseño minimalista, colores pastel y optimizado para móvil (iOS).

## Cómo funciona el voto compartido
Los votos se guardan en un pequeño almacén compartido vía la función
serverless `api/votes.js`, de modo que todos los móviles ven el mismo
recuento agregado en tiempo (casi) real.

## Desarrollo
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Configuración
Edita `src/data.js` para cambiar tartas, criterios o el número de votantes.
