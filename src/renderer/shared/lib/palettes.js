/**
 * Catálogo de paletas de identidad de Uloom. Cada paleta redefine SOLO los
 * tokens de identidad (`--primary`, `--primary-hover`, `--accent`,
 * `--on-primary`) en claro y oscuro; los valores de color viven en
 * `src/renderer/app/index.css` bajo `[data-palette=...]` — este catálogo NO
 * duplica colores, solo ordena los ids y sus claves de etiqueta i18n.
 *
 * La paleta por defecto es `violeta` (los tokens base de `:root`/`.dark`),
 * que igual tiene bloque CSS propio para que el preview de un swatch no
 * herede la paleta activa de la app.
 *
 * ⚠️ Sincronización obligatoria: el allowlist de `public/theme-init.js`
 * (anti-flash) y este catálogo deben listar los mismos ids.
 */

/**
 * @typedef {Object} PaletteDefinition
 * @property {string} id Identificador único de la paleta (== valor de `data-palette`).
 * @property {string} labelKey Clave i18n de su nombre visible (`settings.palette*`).
 */

/** @type {PaletteDefinition[]} */
export const PALETTES = [
  { id: 'violeta', labelKey: 'settings.paletteVioleta' },
  { id: 'azul', labelKey: 'settings.paletteAzul' },
  { id: 'esmeralda', labelKey: 'settings.paletteEsmeralda' },
  { id: 'ambar', labelKey: 'settings.paletteAmbar' },
  { id: 'rosa', labelKey: 'settings.paletteRosa' },
];

/** Id de la paleta por defecto (coincide con el CSS base y el anti-flash). */
export const DEFAULT_PALETTE = 'violeta';

/**
 * Valida que un id de paleta esté en el catálogo.
 * @param {string | null | undefined} palette
 * @returns {string} El id si es válido; `DEFAULT_PALETTE` en caso contrario.
 */
export function normalizePalette(palette) {
  if (PALETTES.some((entry) => entry.id === palette)) {
    return palette;
  }
  return DEFAULT_PALETTE;
}