# Backend — Arquitectura (v0.2.3)

El proceso main de Electron sigue una arquitectura por capas (Controlador-Servicio-Repositorio). El renderer **nunca** llega a Node.js: todo pasa por `preload.js` → `ipc/` → `services/` → `data/`.

## Capas

### 1. `src/preload.js` (El Puente)
Expone `window.uloomApi` vía `contextBridge`. No transforma datos: reexpone `ipcRenderer.invoke` tal cual.

API expuesta (v0.2.1, + navegador y preferencias en v0.2.2):
- `uloomApi.getConfig()` → invoca el canal `config:get`. Resuelve con `{ success, data, error }`.
- `uloomApi.createWorkspace(input)` → invoca el canal `workspace:create`.
- `uloomApi.updateWorkspace(workspace)` → invoca el canal `workspace:update`.
- `uloomApi.getInstalledBrowsers()` → invoca el canal `browser:list`. Devuelve los navegadores instalados detectados.
- `uloomApi.updatePreferences(partial)` → invoca el canal `config:updatePreferences`.

### 2. `src/main/ipc/` (Controladores)
`registerIpcHandlers()` (en `ipc/index.js`) delega el registro en handlers por dominio: `workspaceHandler.js` (canales del dominio workspace), `browserHandler.js` y `preferencesHandler.js`. Todo handler:
- Llama al servicio correspondiente.
- Envuelve en `try/catch` — ningún handler puede dejar escapar una excepción.
- Responde siempre con la forma `{ success: boolean, data?: any, error?: string }` (regla 7 de `rules.md`).

Canales registrados (v0.2.1 + v0.2.2, agrupados por dominio en v0.2.3):
| Canal | Params | Respuesta `data` |
|---|---|---|
| `config:get` | — | `Config` |
| `workspace:create` | `{ name, description?, icon? }` | `Workspace` (creado) |
| `workspace:update` | `Workspace` (completo) | `Workspace` (persistido) |
| `browser:list` | — | `Array<{ id, name }>` (navegadores instalados) |
| `config:updatePreferences` | `Partial<Preferences>` | `Preferences` (merge persistido) |

### 3. `src/main/services/` (Lógica de Negocio)
- `workspaceService.js`: `getConfig()` (config completa normalizada), `createWorkspace()` (genera id con randomUUID, arma `tabs: []`, `openBehavior: 'active-tab'` y `browser: null`), `updateWorkspace()` (delega; update estricto).
- `browserService.js`: `getInstalledBrowsers()` — detecta navegadores instalados con un probe de rutas típicas (Chrome, Edge, Firefox, Brave, Opera, Vivaldi) ancladas en `PROGRAMFILES`/`PROGRAMFILES(X86)`/`LOCALAPPDATA` mediante `fs.existsSync`. Solo Windows; en otras plataformas devuelve `[]`.
- `preferencesService.js`: `getPreferences()` y `updatePreferences(partial)` (merge parcial, delega en el repositorio).

### 4. `src/main/data/` (Repositorios)
- `configStore.js`: única capa que toca el archivo. `readConfig()` valida la raíz (existencia, `workspaces` array, corrupción → default) y normaliza `preferences`; los workspaces pasan **crudos** (la normalización de la entidad vive en su repositorio). Expone también `writeConfig()`, `normalizePreferences()` y `defaultConfig()`/`APP_VERSION` (versión del esquema).
- `workspaceRepository.js`: dueño de la entidad workspace. `normalizeWorkspace()` (rellena `tabs` como array, `openBehavior: 'active-tab'` y `browser: null` — migración de configs viejas), `getConfig()` (config completa con workspaces normalizados), `readWorkspaces()`, `addWorkspace()` y `updateWorkspace()` (update estricto).
- `preferencesRepository.js`: `getPreferences()` y `updatePreferences(partial)` — merge parcial de preferencias sobre las existentes y reescritura del `config.json`.

## Flujos

### Leer configuración
```
renderer: entities/workspace/api/workspaceIpcApi.getConfig()
   → preload: window.uloomApi.getConfig()
   → ipc: 'config:get' → workspaceHandler.getConfig
   → services: workspaceService.getConfig()
   → data: workspaceRepository.getConfig() → normaliza workspaces → configStore.readConfig()
   → respuesta { success, data } sube por la cadena
   → workspaceIpcApi convierte { success:false, error } en throw
```

### Crear sesión
```
useWorkspacesHub.createWorkspace(input)   (pesimista)
   → workspaceIpcApi.createWorkspace(input)
   → preload: createWorkspace
   → ipc: 'workspace:create' → workspaceHandler
   → workspaceService.createWorkspace(input) → id randomUUID + tabs []
   → workspaceRepository.addWorkspace → persiste
   → respuesta: workspace creado; el caller agrega el workspace y cierra el modal
```

### Actualizar (agregar/eliminar pestaña)
Cada mutación de pestañas reescribe el **workspace completo** (todo el array `tabs`) vía `workspace:update`. El update es estricto, por lo que la sesión debe existir en disco (primero se crea).
```
useAddTab / useDeleteTab → useWorkspaces.addTab / deleteTab
   → mutateWorkspace (líder único de escritura, ver abajo)
   → workspaceIpcApi.updateWorkspace(next)
   → ipc: 'workspace:update' → workspaceService.updateWorkspace → repository.updateWorkspace
   → si el id no existe: throw → IPC { success:false } → throw en renderer → console.error en la vista
   → respuesta: el workspace persistido reemplaza al estado local
```
Estrategia **pesimista**: el renderer espera la respuesta del disco como fuente de verdad. No hay optimismo ni rollback.

### Líder único de escritura (v0.2.3, renderer)
Cada mutación de un workspace — pestañas y configuración por sesión — pasa por el **mismo** `mutateWorkspace` del estado global (`useWorkspaceState`). Serializa las escrituras en una cola de promesas y construye cada snapshot sobre el último workspace **persistido** por id (ref por workspace, no React state que puede quedar atrás). Esto elimina la raza cross-feature de v0.2.2, donde un guardado de configuración (`useSessionConfig`) y un alta/baja de pestaña podían pisar snapshots parciales en disco. `useSessionConfig` ya no tiene cola propia: delega en el líder.

## Frontend API (`src/renderer/entities/workspace/api/`)

- `workspaceIpcApi.js` consume `window.uloomApi` y convierte `{ success: false, error }` en `throw new Error(error)`. Expone `getConfig`, `createWorkspace`, `updateWorkspace`, `getInstalledBrowsers`, `updatePreferences`.
- `workspaceIcons.js` expone `WORKSPACE_ICONS` (catálogo de iconos Material Symbols para sesiones) y `WORKSPACE_ICON_PREVIEW_COUNT`.
- `workspaceLaunch.js` (nuevo) expone los catálogos estáticos de lanzamiento: `OPEN_BEHAVIORS`, `SYSTEM_BROWSER`, `SYSTEM_BROWSER_LABEL`, `DEFAULT_BROWSER_LABEL` y `getBrowserNameById`.
- `index.js` es el barrel (exporta toda la API y catálogos).

## Flujos (v0.2.2 + líder único en v0.2.3)

### Guardado inmediato del navegador/comportamiento por sesión
```
useSessionConfig.setOpenBehavior / setBrowser   (merge { ...workspace, openBehavior|browser })
   → mutateWorkspace (líder único) → workspaceIpcApi.updateWorkspace → preload → ipc 'workspace:update'
   → workspaceService.updateWorkspace → repository.updateWorkspace (reescribe la sesión completa, estilo pesimista)
```
La sesión persiste `browser: null` para "Predeterminado" (hereda) o un id de navegador para override fijo.

### Navegadores instalados (`browser:list`)
```
useInstalledBrowsers (shared) → getInstalledBrowsers → preload → ipc 'browser:list'
   → browserService.getInstalledBrowsers → probe de rutas del sistema
```
Se consume desde el Detalle (navegador por sesión) y desde Configuración (preferencia global).

### Preferencia global / herencia
- `preferences.defaultBrowser` se escribe con `config:updatePreferences` (merge parcial desde Configuración → Preferencias).
- Resolución (a consumir por el Launcher en v0.3): `navegador_final = sesión.browser ?? (preferences.defaultBrowser !== 'system' ? preferences.defaultBrowser : null)`; `null` = decide el SO.

## Tipos
Los `@typedef` (`Workspace`, `Tab`, `Config`) viven centralizados en `src/renderer/shared/types.js`. El backend los referencia vía JSDoc `@typedef {import(...)}`.
