# Cambios 0.3.2

v0.3.2 — Pase de UI (roadmap v0.3.2). Unificación de los selectores de ícono de sesión/pestaña en un patrón colapsado compartido (`IconPickerField`), el Hub y el Detalle dejan de lanzar sesiones vacías (botón `(+)` / "Agregar pestaña" según no haya tabs, con los modales de pestaña migrados a `entities/workspace` para ser compartidos), y el navegador efectivo se muestra con su ícono oficial junto a los Select — para el caso "Predeterminado (Sistema)" el id real se resuelve con un canal nuevo `browser:system`. De paso se pagó deuda del reviewer: `useCachedQuery` (hook genérico de query cacheada en `shared/hook`) y `browserService.resolveSystemBrowser` como resolución única y compartida con el launcher de `app.getApplicationInfoForProtocol`.

## 1. Pase de UI — selectores y densidad

- **`widgets/ui/IconPickerField/IconPickerField.jsx`** (nuevo, widget compartido): patrón colapsado de selector de ícono (tile de preview + botón «Subir icono» `disabled` con "Próximamente" / separador «o» / «Elegir uno» que expande la grilla). Lo consume `WorkspaceFormModal` (sesión) y `TabFormModal` (pestaña) — los dos cortes iguales, sin duplicación de markup.
- **`shared/hook/useIconPicker.js`**: `showPicker`/`toggleShowPicker` centralizados (antes eran locales a `useTabForm`); sumado a `showAllIcons`, `visibleIcons`, `selectedIcon`, `selectIcon`, `ensureVisible` y `reset`. `useWorkspaceForm` expone `previewIcon` (`selectedIcon || 'work'`) — la sesión siempre arranca en un símbolo del catálogo (no hay favicon aún).
- **Sesión sin pestañas → agregar pestaña, no lanzar**: no se puede lanzar una sesión vacía.
  - **`entities/workspace/ui/WorkspaceCard.jsx`**: la card con 0 tabs muestra un `IconButton` `(+)` (label `ADD_TAB_LABEL`) que llama `onAddTab(workspace.id)`; con tabs mantiene el play → `onPlay`.
  - **`features/WorkspacesHub/`**: `WorkspaceGrid` recibe `onAddTab`; `useWorkspacesHub` orquesta `tabTargetId` + `useTabModal` + `openAddTab`; `WorkspacesHubView` renderiza `TabFormModal`.
  - **`features/WorkspaceDetail/ui/WorkspaceDetailView.jsx`**: header condicional — sin tabs `Button primary` "Agregar pestaña", con tabs `Button` "Lanzar" (`play_arrow`, `disabled` mientras `isLaunching`). Renombrado a "Lanzar" (textos en español, rules.md §9).
  - **`TabFormModal`/`useTabForm`/`useTabModal` migrados de `features/WorkspaceDetail` a `entities/workspace`** (precedente v0.2.4): ahora los consumen Hub y Detalle; `useTabModal` inyecta `addTab`/`updateTab` para no crear el ciclo `app → entities → app`.
- **`entities/workspace/api/workspaceLabels.js`** (nuevo): `ADD_TAB_LABEL`, `SAVE_CHANGES_LABEL`, `DELETE_TAB_LABEL` centralizadas (se duplicaban entre Hub/Detalle/TabRow).

## 2. Íconos de navegador en el navegador seleccionado

- **`entities/workspace/assets/browsers/`**: 6 SVGs oficiales empaquetados (browser-logos) — `chrome`, `edge`, `firefox`, `brave`, `opera`, `vivaldi`. No hay `system.svg`: el caso "Sistema"/desconocido cae al glifo `public`.
- **`entities/workspace/api/browserIcons.js`**: mapa `BROWSER_ICONS` (id → URL del asset) + `getBrowserIconUrl(browserId)` (null → fallback).
- **`entities/workspace/ui/BrowserIcon.jsx`** (nuevo widget de entidad): renderiza el SVG o el glifo `public` como fallback.
- Renderizado junto al Select en **`features/WorkspaceDetail/ui/WorkspaceConfig.jsx`** (fila "Navegador de uso", alimentado por `useSessionConfig.resolvedBrowserId`, que hoy resuelve el default real del SO cuando la herencia es `system`) y en **`features/Settings/ui/SettingsView.jsx`** (preferencia global; `system` → `systemDefaultId`).

## 3. Navegador del sistema (`browser:system`)

- **`src/main/services/browserService.js`**: `getSystemDefaultBrowser()` — devuelve `{ id, name }` del navegador del SO *si es del catálogo* (mapeo por basename del ejecutable), o `null` (→ ícono genérico).
- **Canal IPC nuevo `browser:system`**: `browserHandler.js` + `src/preload.js` (`getSystemDefaultBrowser`) + `entities/workspace/api/workspaceIpcApi.js` (conversión `{ success:false }` → throw). Forma `{ success, data, error }` respetada.
- **`entities/workspace/hook/useSystemDefaultBrowser.js`**: `{ systemDefaultId, systemDefaultName, isLoading }` con cache a nivel de módulo — 1 consulta por sesión de app, compartida entre Detalle y Configuración; `systemDefaultName` evita re-derivar el nombre desde el probe de instalación (puede no contener al default aún instalado).
- **`useSessionConfig`**: label "Predeterminado (Navegador)" con el default real y `resolvedBrowserId` no nulo para `system` cuando se conoce. **`useSettings`** expone `systemDefaultId` para el ícono de Configuración.
- La consulta es barata (registro del OS); trade-off documentado: si el default del SO cambia con la app abierta, el ícono queda cacheado hasta reiniciar (mismo comportamiento que `browser:list`).

## 4. Pase del @reviewer (deuda) + refactor de la sesión

- **`shared/hook/useCachedQuery.js`** (nuevo hook genérico): consulta IPC cacheada a nivel de módulo (`Map` por `queryKey`, flag de cancelación, `initialData`, reset de cache en error, protección ante `throw` síncrono del loader). Reemplaza el boilerplate de ~40 líneas que `useInstalledBrowsers` y el nuevo `useSystemDefaultBrowser` compartían; ambas consultas quedan como finas capas de shape.
- **`browserService.resolveSystemBrowser()`**: centraliza la resolución del navegador de sistema (`app.getApplicationInfoForProtocol('https:')`) que vivía duplicada en `launcherService` y en la UI; devuelve `{ id, name, path }` con `id: null` si el default no es del catálogo (el launcher usa id/bandera o la heurística por motor del ejecutable). `getSystemDefaultBrowser` (UI) la envuelve.
- **Robustez del label sistema**: `useSystemDefaultBrowser` devuelve el `name` del servicio (nombre del catálogo) en vez de re-derivar el id con `getBrowserNameById` (que degradaba a `chrome` crudo si el default no estaba en el probe).

## Backend / API (resumen de exponibles de la versión)

Canal IPC nuevo: `browser:system` (`getSystemDefaultBrowser`). Se mantiene la forma `{ success, data, error }`, `services/` con fallback a `null` documentado, `ipc/` atrapando y `workspaceIpcApi.js` convirtiendo en throw. `.doc/backend.md` actualizado (canal, `resolveSystemBrowser`/`getSystemDefaultBrowser`, flujo `browser:system`, API de preload; el flujo de lanzamiento ahora referencia `resolveSystemBrowser`). No hubo cambios de esquema en `config.json` (solo el bump de `version` a `0.3.2`).

## Estado

- Lo hecho: `Plan/to_do.md` con los 3 items `v0.3.2` en `[x]` (selector de ícono de sesión con `IconPickerField`, sesión sin pestañas con `(+)`/«Agregar pestaña», íconos de navegador con el default del SO resuelto por `browser:system`) más el pase del reviewer aplicado (`useCachedQuery` + `resolveSystemBrowser` centralizado). Verificación de lint OK.
- Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*`, `AGENTS.md` (sección "Fase actual") actualizado, y `.doc/*` verificados contra el código.