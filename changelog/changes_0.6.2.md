# Cambios 0.6.2

v0.6.2 — Datos de uso y ordenamiento del Hub (segunda entrega de v0.6.0 "Organización del Hub"). La sesión registra su **última vez lanzada** (`lastLaunchedAt`) y su **cantidad de lanzamientos** (`launchCount`) en el propio workspace, y el Hub ganó un **SortBy** (criterios: orden de creación —default—, alfabético, más usadas, última lanzada; las fijadas siguen primero) con persistencia en localStorage. El Detalle suma la card **"Datos de uso"** y la card del Hub reserva un slot de última lanzada en su footer. El **orden manual queda diferido** a un v0.6.x posterior (no se implementó en esta versión).

## 1. Backend: datos de uso de la sesión

- **`src/renderer/shared/types.js`**: `Workspace.lastLaunchedAt` (`string?`, ISO 8601, default `null`) y `Workspace.launchCount` (`number?`, default `0`) — @typedef centralizado (regla 8).
- **`src/main/data/workspaceRepository.js`**: `normalizeWorkspace()` rellena `lastLaunchedAt: null`/`launchCount: 0` ante configs viejas (mismo patrón que `pinned`/`openBehavior`/`browser`) y nuevo método **`recordLaunch(workspaceId)`** — update estricto que setea `lastLaunchedAt` al ahora ISO e incrementa `launchCount`; devuelve la sesión persistida.
- **`src/main/services/workspaceService.js`**: `createWorkspace()` arma `lastLaunchedAt: null`/`launchCount: 0`; `duplicateWorkspace()` clona **sin heredar los datos de uso** (el clon arranca sin historial, igual que sin `pinned`).
- **`src/main/services/launcherService.js`**: al abrir con éxito (`opened > 0`) además de registrar el historial de v0.5.4 registra el **uso de la sesión** (`recordLaunch` best-effort — un fallo del registro nunca convierte el launch en error) y la respuesta pasa a **`{ opened, failed, workspace }`**, donde `workspace` es la sesión persistida actualizada (o `null` si no hubo apertura). Los errores estructurales no registran uso.

## 2. Renderer: sincronización de uso y tiempo relativo

- **`src/renderer/app/hook/useWorkspaceState.js`**: nuevo **`syncWorkspace(workspace)`** — se **encola en el write-chain** y **mergea solo `lastLaunchedAt`/`launchCount`** sobre la versión actual en estado (no reemplaza el objeto completo): así no pisa una mutación concurrente del mismo workspace (ej. toggle de pin o edición de pestaña aplicados mientras el launch resolvía). Sin re-IPC: el main ya persistió. Devuelve `Promise<Workspace | null>` (JSDoc actualizado en `WorkspaceProvider.jsx`).
- **`src/renderer/entities/workspace/hook/useLaunchWorkspace.js`**: opción inyectable **`onLaunched`** (mismo precedente que `useToggleWorkspacePin` con `mutateWorkspace`) — se invoca con `result.workspace` tras un launch exitoso.
- **`src/renderer/shared/lib/relativeTime.js`** (nuevo): **`formatRelativeTime(iso, t)`** — tiempo relativo localizado por claves i18n (regla 9; nada de `Intl.RelativeTimeFormat`): `time.now/minute/hour/day/week/month/year` con plurales. Guarda de fecha inválida (ISO corrupto → `time.now`) y aritmética por meses (365 días no cae en "0 años"). Exportado desde `shared/index.js`.

## 3. Renderer: Hub — SortBy y última lanzada en la card

- **`src/renderer/features/WorkspacesHub/hook/useWorkspacesHub.js`**: criterios `HUB_SORT` (`created` | `alpha` | `usage` | `lastLaunched`) + `HUB_SORT_OPTIONS` (con `labelKey`), `normalizeSort` con fallback al default y comparadores en `SORT_FNS` (`created` devuelve 0 → el sort estable preserva el orden de creación; `lastLaunched` deja las nunca lanzadas al final). Estado `sort` con persistencia en **`localStorage['uloom-sort']`** (patrón theme/language/sidebar; **no** entra al esquema de config.json). `visibleWorkspaces` ordena **fijadas primero** (invariante v0.6.1) y el criterio aplica dentro de cada grupo, también al buscar. El **lanzamiento** pasó a este hook (`useLaunchWorkspace(null, { onLaunched: syncWorkspace })`) — el view dejó de usarlo.
- **`src/renderer/features/WorkspacesHub/hook/index.js`**: barrel exporta `HUB_SORT`/`HUB_SORT_OPTIONS`.
- **`src/renderer/features/WorkspacesHub/ui/WorkspacesHubView.jsx`**: `Select` compacto (`w-40`, `aria-label` `hub.sortBy`) **antes** de la búsqueda — se lee "Ordenar por: [dropdown] [buscar]", con la búsqueda anclada al borde derecho. `sortOptions` mapeados por `t()`.
- **`src/renderer/entities/workspace/ui/WorkspaceCard.jsx`**: el footer **reserva el slot de última lanzada en todas las cards** (ícono `schedule` 16px + `formatRelativeTime`); cuando la sesión nunca se lanzó el slot se conserva con `invisible`/`aria-hidden` para que el footer mantenga la misma altura en la fila y el botón play quede alineado (coherencia, sin shift de layout).

## 4. Renderer: Detalle — card "Datos de uso"

- **`src/renderer/features/WorkspaceDetail/ui/WorkspaceUsageCard.jsx`** (nuevo): card de la columna derecha (entre Configuración y Exportar) con `ResourceCardHeader` `query_stats` y filas `OptionRow` — "Última vez lanzada" (tiempo relativo o **"Nunca lanzada"** cuando no hay timestamp) y "Veces lanzada" (plural `detail.launchCount`). Exportado por el barrel `ui/index.js`.
- **`src/renderer/features/WorkspaceDetail/ui/WorkspaceDetailView.jsx`**: `useLaunchWorkspace(workspace.id, { onLaunched: syncWorkspace })` + card insertada en la columna derecha — el dato se refleja al instante tras lanzar.

## 5. i18n

17 claves nuevas con paridad es/en: `time.now`/`time.minute`/`time.hour`/`time.day`/`time.week`/`time.month`/`time.year` ("Ahora"/"Hace {count} minuto(s)", etc.), `hub.sortBy` ("Ordenar por"/"Sort by"), `hub.sortCreated` ("Orden de creación"/"Creation order"), `hub.sortAlpha` ("Alfabético"/"Alphabetical"), `hub.sortUsage` ("Más usadas"/"Most used"), `hub.sortLastLaunched` ("Última lanzada"/"Last launched"), `detail.usageData` ("Datos de uso"/"Usage data"), `detail.lastLaunched` ("Última vez lanzada"/"Last launched"), `detail.timesLaunched` ("Veces lanzada"/"Times launched"), `detail.launchCount` ("{count} vez/veces"/plural), `detail.neverLaunched` ("Nunca lanzada"/"Never launched"). Sin strings visibles hardcodeados en JSX (regla 9).

## Auditoría (@reviewer)

Sin hallazgos M. Tres L aplicados:
- **L1 — JSDoc del shape de `launch`**: `@returns` actualizado a `{ opened, failed, workspace }` en `workspaceIpcApi.js`, `useLaunchWorkspace.js` y `useWorkspacesHub.js`.
- **L2 — `formatRelativeTime`**: hueco de "Hace 0 años" en diffs de 360–364 días (se deriva `years` de meses) y guarda `Number.isFinite` para ISO inválido (fallback `time.now`).
- **L3 — `syncWorkspace` fuera del write-chain**: se encola en `writeChainRef` (serializado con las demás escrituras del líder) y mergea solo los campos de uso para no pisar mutaciones concurrentes; trade-off documentado en `backend.md` (flujo de launch).

`npm run lint` en verde.

## Docs

- `.doc/backend.md`: `recordLaunch` (repository), defaults en create/duplicate, registro best-effort en el launcher, respuesta `{ opened, failed, workspace }` y flujo de launch con `syncWorkspace` (merge en write-chain); bump de header a v0.6.2.
- `.doc/config_file.md`: campos `lastLaunchedAt`/`launchCount` en la tabla de `Workspace` (defaults, no se copian al duplicar), mutación "Datos de uso de la sesión" y default `version: 0.6.2`; bump de header a v0.6.2.
- `.doc/architecture.md`: `relativeTime.js` (shared/lib) y `WorkspaceUsageCard.jsx` (WorkspaceDetail) en el árbol; bump de header a v0.6.2.
- `.doc/design.md`: bullet "Hub — SortBy y última lanzada" (Select antes del search, criterios, persistencia, slot reservado del footer, card Datos de uso) y grid del Detalle con la card nueva.

## Estado

- Lo hecho: items v0.6.2 de `Plan/to_do.md` en `[x]` (última vez lanzada con `launchCount` y orden de sesiones por criterio). **Orden manual diferido** a v0.6.x posterior (queda `[ ]` en la roadmap). Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*`, `AGENTS.md` (sección "Fase actual") actualizado, changelog completado y roadmap verificado. Lint en verde. No se publicó pre-release (app local de escritorio).
- Fuera de esta fase: v0.6.3 (carpetas, plantillas, orden manual), v0.7.x (tabs avanzadas), personalización manual de colores.