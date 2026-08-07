# Backend — Arquitectura (v0.2.1)

El proceso main de Electron sigue una arquitectura por capas (Controlador-Servicio-Repositorio). El renderer **nunca** llega a Node.js: todo pasa por `preload.js` → `ipc/` → `services/` → `data/`.

## Capas

### 1. `src/preload.js` (El Puente)
Expone `window.uloomApi` vía `contextBridge`. No transforma datos: reexpone `ipcRenderer.invoke` tal cual.

API expuesta (v0.2.1):
- `uloomApi.getConfig()` → invoca el canal `config:get`. Resuelve con `{ success, data, error }`.
- `uloomApi.createWorkspace(input)` → invoca el canal `workspace:create`.
- `uloomApi.updateWorkspace(workspace)` → invoca el canal `workspace:update`.

### 2. `src/main/ipc/index.js` (Controladores)
`registerIpcHandlers()` registra los handlers de `ipcMain`. Todo handler:
- Llama al servicio correspondiente.
- Envuelve en `try/catch` — ningún handler puede dejar escapar una excepción.
- Responde siempre con la forma `{ success: boolean, data?: any, error?: string }` (regla 7 de `rules.md`).

Canales registrados (v0.2.1):
| Canal | Params | Respuesta `data` |
|---|---|---|
| `config:get` | — | `Config` |
| `workspace:create` | `{ name, description?, icon? }` | `Workspace` (creado) |
| `workspace:update` | `Workspace` (completo) | `Workspace` (persistido) |

### 3. `src/main/services/configService.js` (Lógica de Negocio)
- `getConfig()` → delega en el repository. Deja subir errores salvo fallback.
- `createWorkspace({ name, description?, icon? })` → genera el id con `crypto.randomUUID()`, arma el workspace con `tabs: []` y delega en el repository.
- `updateWorkspace(nextWorkspace)` → delega en el repository (update estricto, deja subir el error si el id no existe).

### 4. `src/main/data/configRepository.js` (Repositorio)
Única capa que toca el disco. Lee, valida y escribe `config.json` en `app.getPath('userData')`.

- `readConfig()` → si el archivo no existe o el JSON es inválido, restaura el default escribiéndolo en disco. Normaliza cada workspace (`tabs` → array).
- `writeConfig(config)` → persiste con pretty-print.
- `addWorkspace(workspace)` → agrega, normaliza y escribe; devuelve el persistido.
- `updateWorkspace(nextWorkspace)` → **update estricto (no upsert)**: busca por `id`; si no existe **lanza** `Workspace no encontrado`; si existe, reemplaza normaliza y escribe.
- `defaultConfig()` → `{ version: '0.2.1', workspaces: [] }`.

## Flujos

### Leer configuración
```
renderer: entities/workspace/api/workspaceIpcApi.getConfig()
   → preload: window.uloomApi.getConfig()
   → ipc: 'config:get'
   → services: configService.getConfig()
   → data: configRepository.readConfig()  → config.json en userData
   → respuesta { success, data } sube por la cadena
   → workspaceIpcApi convierte { success:false, error } en throw
```

### Crear sesión
```
useWorkspacesHub.createWorkspace(input)   (pesimista)
   → workspaceIpcApi.createWorkspace(input)
   → preload: createWorkspace
   → ipc: 'workspace:create'
   → configService.createWorkspace(input) → id randomUUID + tabs []
   → configRepository.addWorkspace → persiste
   → respuesta: workspace creado; el caller agrega el workspaces y cierra el modal
```

### Actualizar (agregar/eliminar pestaña)
Cada mutación de pestañas reescribe el **workspace completo** (todo el array `tabs`) vía `workspace:update`. El update es estricto, por lo que la sesión debe existir en disco (primero se crea).
```
useAddTab / useDeleteTab → useWorkspaces.updateWorkspace(nextWorkspace completo)
   → workspaceIpcApi.updateWorkspace(next)
   → ipc: 'workspace:update' → configService.updateWorkspace → repository.updateWorkspace
   → si el id no existe: throw → IPC { success:false } → throw en renderer → console.error en la vista
   → respuesta: el workspace persistido reemplaza al estado local
```
Estrategia **pesimista**: el renderer espera la respuesta del disco como fuente de verdad. No hay optimismo ni rollback.

## Frontend API (`src/renderer/entities/workspace/api/`)

- `workspaceIpcApi.js` consume `window.uloomApi` y convierte `{ success: false, error }` en `throw new Error(error)`. Expone `getConfig`, `createWorkspace`, `updateWorkspace`.
- `workspaceIcons.js` expone `WORKSPACE_ICONS` (catálogo de iconos Material Symbols para sesiones) y `WORKSPACE_ICON_PREVIEW_COUNT`.
- `index.js` es el barrel (exporta `getConfig`, `createWorkspace`, `updateWorkspace`, `WORKSPACE_ICONS`, `WORKSPACE_ICON_PREVIEW_COUNT`).

## Tipos
Los `@typedef` (`Workspace`, `Tab`, `Config`) viven centralizados en `src/renderer/shared/types.js`. El backend los referencia vía JSDoc `@typedef {import(...)}`.
