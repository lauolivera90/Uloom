import { focusRing } from '../focusRing.js';

/**
 * Estilos compartidos de los elementos de formulario. Token del sistema de diseño
 * (ver src/renderer/app/index.css), sin valores hardcodeados.
 */
export const formElementStyles = `w-full px-3 py-2 text-sm bg-background border border-border rounded text-text placeholder:text-text/40 ${focusRing}`;