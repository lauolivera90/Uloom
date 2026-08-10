# Cambios 0.4.2

v0.4.2 — Portabilidad completa (importación) + Temas runtime + Shell de la ventana. La segunda mitad de la portabilidad deja de ser placeholder: **Importar** en Configuración → Sesiones carga un `.json` con el diálogo nativo de apertura y reconstruye el catálogo con semántica por `kind` (`workspace` agrega la sesión, `backup` restaura el catálogo completo preservando `preferences`). El **tema** deja de ser maqueta: `ThemeProvider` + `useTheme` con persistencia en `localStorage['uloom-theme']`, default a `prefers-color-scheme` y script anti-flash en el `<head>` que respeta la CSP. La **ventana** gana dimensiones reales con mínimos y pierde la barra de menú nativa. Además se eliminó el `openDevTools()` automático de arranque.

## 1. Importación de sesiones (`portability:import`)

- **`src/main/data/workspaceRepository.js`**: `importWorkspaces(workspaces, { replace })` — normaliza cada sesión importada y persiste: con `replace: true` (respaldo) el catálogo pasa a ser la lista importada preservando `preferences`; con `replace: false` (sesión individual) agrega las importadas a las existentes, regenerando el `id` (randomUUID) de cualquier importada que colisione con una sesión local — nunca pisa lo del usuario. Devuelve la lista final.
- **`src/main/services/portabilityService.js`**: `importFromFile()` — abre `dialog.showOpenDialog` (filtro `.json`, cancelar ≠ error → `{ canceled: true }`), lee el archivo y valida el wrapper (`app: 'uloom'`, `kind` en `workspace|backup`, `schemaVersion` string, `data` array de workspaces con `name` string); cualquier otra cosa lanza con mensaje descriptivo sin tocar `config.json`. Delega en `importWorkspaces` con `replace: kind === 'backup'` y devuelve `{ canceled, imported }` (lista final persistida).
- **`src/main/ipc/portabilityHandler.js`**: canal nuevo `portability:import` (misma forma `{ success, data, error }`).
- **`src/preload.js`**: `uloomApi.importFromFile()`.
- **`entities/workspace/api/portabilityIpcApi.js`**: `importFromFile()` — convierte `{ success: false }` en throw; devuelve `{ canceled, imported }`.
- **Configuración — `features/Settings/ui/SettingsView.jsx` + `hook/usePortability.js`**: el botón "Importar" (que ya tenía `icon="upload"` + `IMPORT_LABEL`) queda cableado: `importSessions` → `useWorkspaces.importWorkspaces` con `disabled` mientras importa. Sin mensajes de éxito (convención actual, `console.error` en fallos como el resto de la portabilidad).
- **`app/hook/useWorkspaceState.js`**: `importWorkspaces()` serializado en el líder único de escritura (`writeChainRef`); ante éxito rehidrata el catálogo y el ref de última escritura con la lista persistida (hydrate extraído a `hydrateCatalog`, ahora compartido con el load inicial).

## 2. Sistema de temas (runtime)

- **`src/theme-init.js`** (nuevo): script clásico en el `<head>` de `index.html` (externo, permitido por la CSP `script-src 'self'` — no es inline). Aplica `.dark` al `<html>` **antes del paint**: usa la elección guardada en `localStorage['uloom-theme']` o, sin elección previa, el `prefers-color-scheme` del sistema (no persiste la resolución automática — el default queda "a gusto del SO" hasta que el usuario toque el toggle).
- **`app/hook/useTheme.js`** (nuevo) + **`app/ThemeProvider.jsx`** (nuevo): contexto global con `{ theme, setTheme, toggleTheme }`. El estado se siembra desde la clase que ya aplicó el anti-flash; cada cambio muta `.dark` en el `documentElement` (activa las variables CSS de `index.css`) y persiste en `localStorage['uloom-theme']`. Exponidos por el barrel `app/index.js`. `App` quedó envuelto en `<ThemeProvider>`.
- **`features/Settings/hook/useSettings.js`**: el toggle de Tema (maqueta local) consume ahora `useTheme()` real — mismo contrato `{ theme, toggleTheme }`, sin estado local.

## 3. Shell de la ventana (`src/main.js`)

- `width: 1100`, `height: 750`, `minWidth: 800`, `minHeight: 600`.
- `autoHideMenuBar: true` — el menú nativo se oculta y reaparece con Alt (se conservan los atajos de esa barra).
- Eliminado `mainWindow.webContents.openDevTools()` (quedaba abierto en cada arranque).

## Backend / API (resumen de exponibles de la versión)

Canal IPC nuevo: `portability:import`. Se mantiene la forma `{ success, data, error }`, `services/` con validaciones descriptivas, `ipc/` atrapando y la API del renderer convirtiendo en throw. `.doc/backend.md` actualizado (preload `importFromFile`, canal, flujos de importación, `importWorkspaces`, frontend API) y `.doc/config_file.md` (semántica de importación por `kind`). No hubo cambios de esquema en `config.json` (solo el bump de `version` a `0.4.2`); `SCHEMA_VERSION` del formato de exportación sigue en `'0.4.1'` porque el formato de datos no cambió (el import valida el wrapper, no lo reescribe). El tema no toca `config.json`: vive en `localStorage` del renderer.

Se documentaron también en `Plan/to_do.md` (los cuatro items v0.4.2 en `[x]`).

## Fuera de esta fase

- Runtime ya completo; no queda pendiente conocido dentro del MVP. Próxima hoja de ruta en `Plan/to_do.md` / temas para evaluar.

## Estado

- Lo hecho: items v0.4.2 de `Plan/to_do.md` (importar sesión/sistema, temas runtime, tamaño de ventana con mínimos y quitar el menú) en `[x]`, con la decisión de import (backup reemplaza / sesión agrega) y de menú (`autoHideMenuBar`) confirmadas durante el desarrollo.
- Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*`, `.doc/backend.md`/`.doc/config_file.md` sincronizados con el IPC/service/repository, `AGENTS.md` (sección "Fase actual") actualizado. Verificación de lint OK. No se publicó pre-release (app local de escritorio).