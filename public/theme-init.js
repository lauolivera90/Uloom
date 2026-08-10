/**
 * Anti-flash de tema: script clásico en el `<head>` que se ejecuta
 * síncronamente, antes de que el navegador pinte el documento, aplicando la
 * clase `.dark` al `<html>` sin destellos. Respeta la preferencia guardada en
 * localStorage (`uloom-theme`); si no hay elección previa, resuelve desde el
 * color scheme del sistema (no persiste la resolución — el default queda "a
 * gusto del SO" hasta que el usuario use el toggle). No depende de módulos:
 * es un script clásico permitido por la CSP (`script-src 'self'`) y vive en
 * `public/` para que Vite lo copie tal cual al build del renderer.
 */
(function () {
  var STORAGE_KEY = 'uloom-theme';

  function storedTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch (error) {
      // Sin localStorage el tema se resuelve igual por el color scheme
    }
    return null;
  }

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var theme = storedTheme() || systemTheme();
  document.documentElement.classList.toggle('dark', theme === 'dark');
})();