# Cambios 0.2.3

Versión de **refactor y deuda técnica** (sin features nuevas). Los tres features del MVP ya están operativos; acá se paga deuda del @reviewer y se termina la separación por dominio del backend.

## Backend por dominio

Los archivos monolíticos restantes se dividen en archivos por dominio (en v0.2.2 ya se habían separado browser/preferences):

- `data/configRepository.js` (monolítico) → **`configStore.js`** (única capa que toca el archivo: `readConfig`/`writeConfig`/defaults/`APP_VERSION`, normaliza `preferences`; los workspaces pasan crudos) + **`workspaceRepository.js`** (entidad workspace: `getConfig` completo normalizado, `readWorkspaces`, `addWorkspace`, `updateWorkspace` estricto, `normalizeWorkspace`).
- `services/configService.js` → **`workspaceService.js`** (`getConfig`, `createWorkspace` con randomUUID, `updateWorkspace`).
- `ipc/index.js` ahora **orquesta handlers por dominio**: `workspaceHandler.js` (canales `config:get`, `workspace:create`, `workspace:update`) + `browserHandler.js` + `preferencesHandler.js` (intactos).
- Sin cambio de comportamiento: mismas respuestas `{ success, data, error }`, mismos canales, mismo esquema de `config.json`.

## Líder único de escritura (raza cross-feature resuelta)

`useWorkspaceState` expone **`mutateWorkspace(workspaceId, mutator)`**: única vía de escritura de workspaces. Serializa las escrituras en una cola de promesas y parte siempre del último workspace **persistido** por id (ref por workspace, no React state), de modo que un guardado de configuración y un alta/baja de pestaña solapados ya no pisan snapshots parciales en disco.

- `addTab` / `deleteTab` delegan en el líder; `updateWorkspace` salió de la API del contexto.
- `useSessionConfig` perdió su cola y sus refs locales: delega en el líder y conserva solo `isSaving`/`error` de UI.

## Deuda de widgets y formularios (@reviewer)

- Widget **`ModalFooter`** (`widgets/ui/ModalFooter`): par cancelar (outline) + confirmar (variante semántica), reparto `flex-1` y spinner en `isLoading`. Consumido por `CreateWorkspaceModal`, `AddTabModal` y `ConfirmDialog` — elimina la duplicación del footer de modales.
- Hook compartido **`useIconPicker`** en `shared/hook` (genérico: recibe `icons`/`previewCount` — shared no importa de entities). Consumido por `useCreateWorkspace` y `useAddTabForm`, eliminando la duplicación del picker.
- **a11y de `FormField`**: `required`/`aria-required` se propagan al control hijo (hoy guardaron solo el asterisco con `aria-hidden`).
- **`@typedef` nombrados** de formularios: `CreateWorkspaceFormState` y `AddTabFormState` definidos en sus hooks; los modales referencian el tipo vía JSDoc (fuera del tipado manual que se desincroniza).
- `widgets/index.js`: reexportaba `layout/` desde v0.2.2; ítem destildado por verificación contra el código.

## Documentación

- `.doc/backend.md`: capas por dominio, canales por handler y flujos actualizados al líder único de escritura.
- `.doc/config_file.md`: referencia a `configStore`/`workspaceRepository` en vez del monolítico.
- `.doc/architecture.md`: árbol de backend por dominio, `ModalFooter` y la **excepción estructural** de la familia `ui/form/` (agrupada con barrel propio, a diferencia de `ui/<Widget>/<Widget>.jsx`).
- `.doc/design.md`: convención de footer de modales vía `ModalFooter`.

## Revisión del reviewer (aplicada)

- **Fix del `reset` compuesto** de `useCreateWorkspace`: el spread del picker pisaba el `reset` del form (cancelar no limpiaba nombre/descripción) — ya no se esparce `picker` entero.
- `useIconPicker` sin dependencia de entities (shared limpio).
- Setters de `useSessionConfig` devuelven `persist(...)` (JSDoc `Promise<void>` acorde).
- `ConfirmDialog` no re-declara labels default; spinner del footer con `aria-hidden`.

## Versiones

- Unificación de versión a `0.2.3`: `package.json`, `package-lock.json`, `APP_VERSION` en `configStore.js`, `backend.md`, `config_file.md` y `architecture.md`.
- El esquema de `config.json` no cambió (refactor sin campos nuevos): se actualiza el `version` del default (los configs existentes preservan su versión previa).