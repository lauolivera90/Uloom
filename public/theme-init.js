/**
 * Anti-flash de tema y paleta: script clásico en el `<head>` que se ejecuta
 * síncronamente, antes de que el navegador pinte el documento, aplicando la
 * clase `.dark` y el atributo `data-palette` al `<html>` sin destellos.
 *
 * Tema: respeta la preferencia guardada en localStorage (`uloom-theme`); si no
 * hay elección previa, resuelve desde el color scheme del sistema (no persiste
 * la resolución — el default queda "a gusto del SO" hasta que el usuario use el
 * toggle).
 *
 * Paleta: aplica `data-palette` desde `uloom-palette` (default `violeta`).
 * El allowlist de ids debe mantenerse sincronizado con `shared/lib/palettes.js`
 * (los valores de color viven SOLO en `index.css`, por `[data-palette=...]`).
 *
 * No depende de módulos: es un script clásico permitido por la CSP
 * (`script-src 'self'`) y vive en `public/` para que Vite lo copie tal cual al
 * build del renderer.
 */
(function () {
  var THEME_KEY = 'uloom-theme';
  var PALETTE_KEY = 'uloom-palette';
  var PALETTES = ['violeta', 'azul', 'esmeralda', 'ambar', 'rosa'];
  var DEFAULT_PALETTE = 'violeta';

  function storedTheme() {
    try {
      var stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch (error) {
      // Sin localStorage el tema se resuelve igual por el color scheme
    }
    return null;
  }

  function storedPalette() {
    try {
      var stored = localStorage.getItem(PALETTE_KEY);
      if (PALETTES.indexOf(stored) !== -1) {
        return stored;
      }
    } catch (error) {
      // Sin localStorage se usa la paleta por defecto
    }
    return DEFAULT_PALETTE;
  }

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var theme = storedTheme() || systemTheme();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.setAttribute('data-palette', storedPalette());
})();