/**
 * SafeArea — mantiene el contenido crítico fuera de las bandas donde
 * Reels / TikTok / Shorts superponen su UI.
 *
 *   - 220 px arriba  (avatar, botón de seguir, nombre de sonido)
 *   - 340 px abajo   (caption, likes/compartir, barra de progreso)
 *
 * Valores en tokens.safeArea. Envuelve el contenido de cada escena.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { safeArea } from '../theme/tokens';

export const SafeArea: React.FC<{
  children: React.ReactNode;
  /** Alineación vertical del contenido dentro de la zona segura. */
  align?: 'top' | 'center' | 'bottom';
  /**
   * Reserva la banda inferior de subtítulos (safeArea.captionBand) para que el
   * contenido de la escena nunca se solape con los subtítulos quemados.
   * Por defecto true.
   */
  reserveCaption?: boolean;
  /** Muestra guías de depuración (solo para ajustar composición). */
  debug?: boolean;
  style?: React.CSSProperties;
}> = ({
  children,
  align = 'center',
  reserveCaption = true,
  debug = false,
  style,
}) => {
  const justifyContent =
    align === 'top' ? 'flex-start' : align === 'bottom' ? 'flex-end' : 'center';

  return (
    <AbsoluteFill
      style={{
        paddingTop: safeArea.top,
        paddingBottom: safeArea.bottom + (reserveCaption ? safeArea.captionBand : 0),
        paddingLeft: safeArea.left,
        paddingRight: safeArea.right,
        display: 'flex',
        flexDirection: 'column',
        justifyContent,
        ...style,
      }}
    >
      {children}
      {debug ? <DebugGuides /> : null}
    </AbsoluteFill>
  );
};

const DebugGuides: React.FC = () => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: safeArea.top,
        background: 'rgba(192, 106, 75, 0.12)',
        borderBottom: '2px dashed rgba(192,106,75,0.5)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: safeArea.bottom,
        background: 'rgba(192, 106, 75, 0.12)',
        borderTop: '2px dashed rgba(192,106,75,0.5)',
      }}
    />
  </>
);
