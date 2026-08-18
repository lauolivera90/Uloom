# Cambios 0.5.3

v0.5.3 — Duplicar sesión. Clonar una sesión existente (tabs + configuración de lanzamiento) con id nuevo y datos básicos editables desde el modal, más feedback visual para los resultados que no se ven desde la vista actual. Un canal IPC nuevo en el backend y 3 hooks/1 función pura nuevos en el renderer.

## 1. Backend: canal `workspace:duplicate`

- **`src/main/services/workspaceService.js`**: `duplicateWorkspace(sourceId, { name, description?, icon? })` — lee la sesión fuente con `getWorkspaceById` (lectura estricta del repositorio), arma el clon `{ id: randomUUID(), name, description, icon, tabs: source.tabs.map(tab => ({ ...tab, id: randomUUID() })), openBehavior: source.openBehavior, browser: source.browser }` y lo persiste con `addWorkspace`. La fuente nunca se modifica. Los ids de las tabs clonadas se regeneran (única garantía de unicidad global de `Tab.id`; los favicons cacheados se copian tal cual).
- **`src/main/ipc/workspaceHandler.js`**: canal `workspace:duplicate` con try/catch estándar (`{ success, data, error }`).
- **`src/preload.js`** + **`src/renderer/entities/workspace/api/workspaceIpcApi.js`**: `duplicateWorkspace(sourceId, input)` — misma conversión de `{ success: false }` en throw; exportado por los barrels de la entidad.
- Docs actualizados en `.doc/backend.md` (regla 6): API de preload, tabla de canales, service y flujo "Duplicar sesión (v0.5.3)".

## 2. Renderer: estado, nombre inferido y modal

- **`app/hook/useWorkspaceState.js`**: `duplicateWorkspace(sourceId, input)` — patrón idéntico a `createWorkspacePersisted` (await del IPC + actualiza `latestByWorkspaceRef` + append al catálogo). JSDoc del hook y de `WorkspaceProvider`/`useWorkspaces` actualizado (hallazgo L1 del @reviewer).
- **`shared/lib/workspaceName.js`** (nuevo, vía `shared/index.js`): `inferDuplicateName(name, existingNames)` — semántica **`root (count)`**: si el nombre ya termina en ` (N)` se descarta el sufijo para obtener el root; el resultado es el root seguido de la cantidad de sesiones existentes cuyo nombre es el root o `root (N)`. **Nunca apila sufijos** (`hola (1)(1)` jamás) y nunca colisiona. `hola` → `hola (1)` → `hola (2)`; duplicar `hola (1)` da `hola (2)`. Verificado con casos de prueba (incluidos nombres con paréntesis internos y huecos numéricos).
- **`features/WorkspaceDetail/hook/useDuplicateWorkspace.js`** (nuevo, barrel del feature): arma el prefill `{ ...workspace, name: inferDuplicateName(...) }` con el id de la fuente intacto (el guard de repoblado de `useWorkspaceForm` no se rompe — verificado por @reviewer: `open()` → `reset()` lee el prefill fresco, el guard solo gatea el reset por cambio de id), y el submit llama `duplicateWorkspace(source.id, data)`. La sesión original no se toca; los tabs se editan después como siempre, manualmente.
- **`entities/workspace/ui/WorkspaceFormModal.jsx`**: prop `isDuplicating` (preferente sobre `isEditing`) → título "Duplicar sesión", confirmar "Duplicar" e ícono `content_copy`. Ternarias de UI triviales (regla 1).
- **`features/WorkspaceDetail/ui/WorkspaceDetailView.jsx`**: botón `IconButton` ghost con `content_copy` en el header del Detalle, entre editar (warning) y eliminar (danger). Segundo `WorkspaceFormModal` cableado al hook de duplicado. Al confirmar se queda en el Detalle (la copia aparece en el Hub).

## 3. Feedback visual (política de toasts, regla 10)

Nueva interpretación del caso "resultado no visible" y aplicación donde faltaba:

- **`duplicate.success`**: duplicar se dispara desde el Detalle de la original; el modal cierra pero la copia aparece en el **Hub** (vista no visible desde el Detalle, sin navegación) → **toast de éxito** justificado por el principio de design.md §3 (mismo criterio que `exportSession`). Emitido en `useDuplicateWorkspace` tras el submit exitoso; el error sigue cubierto por `useWorkspaceFormModal` (`save.error`), sin doble feedback.
- **`create.success`** + **`app/hook/useGlobalCreateWorkspace.js`** (nuevo): se extrajo a hook la máquina del modal global de alta (antes inline en `AppShell`) y el alta del Sidebar ahora **tostéa solo fuera del Hub** (`location.pathname !== '/'`): en el Hub la card aparece in-place (sin toast); en Configuración/Detalle el catálogo nuevo vive en otra vista (con toast). El alta del Hub (`useWorkspacesHub`) queda sin toast (resultado visible — correcto).
- Docs vivos sincronizados: `design.md` §3 y `rules.md` §10 listan `duplicate` y `create-global` entre los casos de éxito aplicados, con la nota del `create` condicional.

## 4. i18n

5 claves nuevas con paridad es/en: `workspaceForm.duplicateTitle` ("Duplicar sesión"/"Duplicate session"), `workspaceForm.confirmDuplicate` ("Duplicar"/"Duplicate"), `detail.duplicateSession` ("Duplicar sesión"/"Duplicate session"), `duplicate.success` ("Sesión duplicada"/"Session duplicated") y `create.success` ("Sesión creada"/"Session created"). Sin strings visibles hardcodeados en JSX (regla 9).

## Auditoría (@reviewer)

Dos pasadas, sin hallazgos M. Se aplicaron los L: JSDoc de `useWorkspaces` (L1, `duplicateWorkspace` agregado al `@returns`) y la sincronización de los docs vivos (design.md §3/rules.md §10, hallazgo L del segundo pase). Quedan 2 L documentados como deuda deliberada: el par `duplicateTitle`/`duplicateSession` repite el patrón existente `editTitle`/`editSession` (consistente con la convención de regla 9, saneable en otra fase), y en `useGlobalCreateWorkspace` el condicional usa el string crudo `pathname === '/'` (frágil si el Hub cambia de ruta — derivar de una constante de rutas cuando exista) y el import intra-app de `useWorkspaces` por archivo (seguro, evita un ciclo latente). `npm run lint` en verde.

## Docs

- `.doc/backend.md`: canal `workspace:duplicate`, API de preload/service, flujo "Duplicar sesión" y bump de header a v0.5.3.
- `.doc/config_file.md`: solo bump de header/version default (sin campos nuevos en `config.json`).
- `.doc/architecture.md`: bump de header + `workspaceName.js` y `useGlobalCreateWorkspace.js` en el árbol.
- `.doc/design.md` §3 / `.doc/rules.md` §10: casos `duplicate` y `create-global` en la política de toasts.

## Estado

- Lo hecho: el item v0.5.3 de `Plan/to_do.md` en `[x]` — con la nomenclatura real `root (count)` (el roadmap decía "Copia de [nombre]", se reemplazó por la semántica `(N)` que pediste). Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*`, `AGENTS.md` (sección "Fase actual") actualizado, changelog completado y roadmap verificado. Lint en verde. No se publicó pre-release (app local de escritorio).
- Fuera de esta fase: v0.5.4 (historial de tabs), personalización manual de colores y quick wins del Hub (v0.6.x). Deuda anotada: precedente de rutas crudas para el toast condicional del `create` global.