# Cambios 0.5.4

v0.5.4 — Historial de pestañas. Registro liviano de tabs usadas (agregadas o lanzadas) separado de las sesiones, para reutilizarlas rápido: el modal de agregar pestaña pasó a dos modos con **segment control Manual | Historial**, donde el Historial es **selección múltiple** (checkboxes) que agrega el lote en una sola escritura. Nuevo dominio en el backend (repository + service + handler) y un hook compuesto en el renderer que consolidó el wiring del modal.

## 1. Backend: dominio `tabHistory`

- **`src/main/data/tabHistoryRepository.js`** (nuevo): dueño de `config.tabHistory`. `normalizeTabHistory()` (garantiza array, descarta entradas sin URL, rellena defaults), `readTabHistory()` (normalizado y ordenado: `count` desc → desempate `lastUsedAt` desc), `recordTabs(tabs)` (upsert por URL — nueva crea con `count: 1`; existente incrementa, actualiza `lastUsedAt` y refresca `name`/`icon`/`favicon` — ordena y aplica el cap `MAX_TAB_HISTORY = 20` con evicción de las menos usadas) y `clearTabHistory()` (vacía y devuelve la cantidad removida).
- **`src/main/services/tabHistoryService.js`** (nuevo): `getTabHistory()`, `recordTabs(tabs)` con el mapeo centralizado `tabToHistoryEntry`, `recordTabsBestEffort(tabs)` (best-effort: atrapa errores y solo loguea — un fallo del historial nunca convierte el update/launch en error) y `clearTabHistory()`. `@typedef` `TabHistoryEntry` y `Config.tabHistory` en `src/renderer/shared/types.js`.
- **`src/main/ipc/tabHistoryHandler.js`** (nuevo, registrado en `ipc/index.js`): canales `tabHistory:get` (historial ordenado) y `tabHistory:clear` (`{ cleared }`). **`src/preload.js`** + **`src/renderer/entities/workspace/api/tabHistoryIpcApi.js`** (nuevo, barrels actualizados): `getTabHistory()`/`clearTabHistory()` con la conversión estándar de `{ success: false }` en throw.
- **`src/main/data/configStore.js`**: `defaultConfig()` ahora incluye `tabHistory: []` (v0.5.4).
- **Alimentación del registro (sin canal propio)**: `workspaceService.updateWorkspace` lee el previo con `getWorkspaceById`, persiste y calcula las URLs **nuevas por diff** (en `next`, no en `prev` — editar/borrar no re-registra) → `recordTabsBestEffort`. `launcherService.launchWorkspace` registra las URLs abiertas con éxito (en el fallback `openExternal` solo las `fulfilled`).
- Docs actualizados en `.doc/backend.md` y `.doc/config_file.md` (regla 6): API de preload, tabla de canales, services/repository y flujo "Historial de pestañas (v0.5.4)".

## 2. Renderer: modal de pestaña con dos modos

- **`entities/workspace/ui/TabFormModal.jsx`**: en alta el modal ofrece **segment control** (dos `Button` `variant={activo ? 'primary' : 'ghost'}`, patrón del navegador de Configuración, oculto en edición) entre **Manual** (el form de siempre) y **Historial** (selección múltiple): filas con checkbox nativo (`accent-primary`) sobre `visibleEntries` (ya filtradas por `useTabHistory`), lista `max-h-72` con scroll propio, y footer "Agregar seleccionadas" habilitado solo con selección. El segment se deshabilita cuando no hay nada para mostrar (`historyDisabled`), decidido antes de abrir el modal.
- **`shared/lib/historyTabs.js`** (nuevo, vía `shared/index.js`): `buildTabsFromHistory(entries)` — mapea entradas → `Tab[]` copiando `name`/`icon`/`favicon` guardados (sin fetch de metadatos) con ids únicos (`crypto.randomUUID`, fallback `tab-<ts>-<idx>`).
- **`app/hook/useWorkspaceState.js`**: `addTabs(workspaceId, tabs[])` — una sola `mutateWorkspace` que appenda el lote (una escritura en disco, serializada en el líder); JSDoc de `useWorkspaces`/`WorkspaceProvider` actualizado.
- **`entities/workspace/hook/useTabModal.js`**: prop `addTabs`, `onSubmitTabs(tabs)` (mismo patrón que `onSubmitTab` + toast `save.error`) y estado `mode` (`'manual' | 'history'`) reseteado en cada `openAdd`/`openEdit`.
- **`entities/workspace/hook/useTabHistory.js`** (nuevo): carga el historial **al montar la vista y en cada apertura** (flag de cancelación, sin cache de módulo y sin refetch al cerrar), resetea la selección en cada apertura (render-adjustment) y deriva `visibleEntries`/`selectedCount`/`selectedEntries` desde un solo `useMemo` filtrado por `existingUrls`. Fallo de carga = soft-fallback (queda el último estado conocido).
- **`entities/workspace/hook/useTabFormModal.js`** (nuevo, composite en el barrel): consolida `useTabModal` + `useTabForm` + `useTabHistory` + handlers de cancelar/confirmar lote (resetea el form tras el batch exitoso). Elimina la duplicación de wiring entre Hub y Detalle (hallazgo M2 del @reviewer). `useTabHistory` se exporta solo internamente (regla 5).
- **Vistas** (`WorkspacesHubView`/`WorkspaceDetailView` + `useWorkspacesHub`): pasan al modal `mode`/`onModeChange`/`visibleEntries`/`historyDisabled`/`selectedCount`/`selectedUrls`/`onToggleHistoryEntry`/`onConfirmBatch`. El registro de metadatos sigue igual: el diff del backend registra el lote completo de una.
- **Configuración → Sesiones**: fila "Borrar historial de pestañas" (`usePortability.clearHistory` → `useWorkspaces.clearTabHistory`, write leader) con toast de éxito/error (resultado no visible en Settings, regla 10).

## 3. i18n

4 claves nuevas con paridad es/en: `tabForm.modeManual` ("Manual"/"Manual"), `tabForm.modeHistory` ("Historial"/"History"), `tabForm.confirmMultiple` ("Agregar seleccionadas"/"Add selected") y `tabForm.historyEmpty` ("Todavía no hay pestañas en el historial…"/"No tabs in history yet…"). Se eliminó la clave muerta `tabForm.historyUse` (reemplazada por el checkbox nativo) y `tabForm.history` (ya no referenciada). Sin strings visibles hardcodeados en JSX (regla 9).

## Auditoría (@reviewer)

Dos pasadas. **Primera:** 3 hallazgos M (form stale tras confirmar lote, duplicación del wiring entre vistas, lógica derivada de selección en el JSX) + L (useMemo, JSDoc del reset, useCallback ruido, dos convenciones de id, clave i18n muerta) — todos aplicados: hook compuesto `useTabFormModal`, derivación en `useTabHistory`, `crypto.randomUUID` para los ids del lote, `useMemo` y docs sincronizados. **Segunda (disable del segment):** 0 hallazgos M; se aplicaron los L: `useTabHistory` fuera de los barrels (solo lo consume `useTabFormModal` internamente) y JSDoc de `tabModal` en `useWorkspacesHub` completo (`isSaving`/`editingTab`). Quedan 2 L deliberados: el bloque `<TabFormModal …>` duplicado verbatim entre vistas (patrón pre-existente, mismo que `WorkspaceFormModal`; saneable con un wrapper en otra fase) y el transiente aceptado de que el segment pueda deshabilitarse con el modal abierto si el primer fetch resuelve vacío (raro; "Manual" siempre activo y el footer tiene Cancelar). `npm run lint` en verde.

## Docs

- `.doc/backend.md`: dominio `tabHistory` (API de preload, tabla de canales, service/repository), flujo "Historial de pestañas (v0.5.4)" con el lote y bump de header a v0.5.4.
- `.doc/config_file.md`: campo `tabHistory` (default `[]`), sección "Historial de pestañas", flujo del lote y bump de header/default a v0.5.4.
- `.doc/architecture.md`: `tabHistoryHandler/Service/Repository`, `tabHistoryIpcApi`, `useTabHistory`/`useTabModal`/`useTabFormModal`, `TabFormModal` y `historyTabs.js` en el árbol; bump de header a v0.5.4.

## Estado

- Lo hecho: el item v0.5.4 de `Plan/to_do.md` en `[x]`. Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers/defaults de `.doc/*`, `AGENTS.md` (sección "Fase actual") actualizado, changelog completado y roadmap verificado. Lint en verde. No se publicó pre-release (app local de escritorio).
- Fuera de esta fase: v0.6.1 (quick wins del Hub: favoritos/pinned + búsqueda de sesiones), personalización manual de colores y v0.6.x en general.