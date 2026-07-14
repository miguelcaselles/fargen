/**
 * remotion.config.ts — configuración de render (no afecta a producción del vídeo
 * en sí, que vive en src/). Ver https://remotion.dev/docs/config
 */
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setOverwriteOutput(true);
// Concurrencia moderada para entornos con memoria limitada.
Config.setConcurrency(2);

// Usa el Chromium ya instalado en el entorno si está disponible, en lugar de
// descargar uno. En local puedes borrar esta línea y dejar que Remotion gestione
// su propio navegador.
const envBrowser = process.env.REMOTION_BROWSER_EXECUTABLE;
if (envBrowser) {
  Config.setBrowserExecutable(envBrowser);
}
