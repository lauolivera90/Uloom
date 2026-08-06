# Backend — Arquitectura (v0.1.4)

El proceso main de Electron sigue una arquitectura por capas (Controlador-Servicio-Repositorio). El renderer **nunca** llega a Node.js: todo pasa por `preload.js` → `ipc/` → `services/` → `data/`.

## Capas

### 1. `src/preload.js` (El Puente)
Expone `window.uloomApi` vía `contextBridge`. No transforma datos: reexpone `ipcRenderer.invoke` tal cual.

API expuesta (v0.1.4):
- `uloomApi.getConfig()` → invoca el canal `config:get`. Resuelve con `{ success, data, error }`.

### 2. `src/main/ipc/index.js` (Controladores)
`registerIpcHandlers()` registra los handlers de `ipcMain`. Todo handler:
- Llama al servicio correspondiente.
- Envuelve en `try/catch` — ningún handler puede dejar escapar una excepción.
- Responde siempre con la forma `{ success: boolean, data?: any, error?: string }` (regla 7 de `rules.md`).

Canales registrados (v0.1.4):
| Canal | Params | Respuesta `data` |
|---|---|---|
| `config:get` | — | `Config` |

### 3. `src/main/services/configService.js` (Lógica de Negocio)
- `getConfig()` → delega en el repository. Deja subir errores salvo fallback.

### 4. `src/main/data/configRepository.js` (Repositorio)
Única capa que toca el disco. Lee, valida y escribe `config.json` en `app.getPath('userData')`.

- `readConfig()` → si el archivo no existe o el JSON es inválido, restaura el default escribiéndolo en disco.
- `writeConfig(config)` → persiste con pretty-print.
- `defaultConfig()` → `{ version: '0.1.3', workspaces: [] }`.

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

## Frontend API (`src/renderer/entities/workspace/api/`)

- `workspaceIpcApi.js` consume `window.uloomApi` y convierte `{ success: false, error }` en `throw new Error(error)`.
- `mockWorkspaces.js` expone sesiones de prueba (`mockWorkspaces`) para el Hub durante la fase de mock; no cruza IPC.
- `workspaceIcons.js` expone `WORKSPACE_ICONS` (catálogo de iconos Material Symbols para sesiones) y `WORKSPACE_ICON_PREVIEW_COUNT`.
- `index.js` es el barrel (exporta `getConfig`, `mockWorkspaces`, `WORKSPACE_ICONS`, `WORKSPACE_ICON_PREVIEW_COUNT`).

## Tipos
Los `@typedef` (`Workspace`, `Tab`, `Config`) viven centralizados en `src/renderer/shared/types.js`. El backend los referencia vía JSDoc `@typedef {import(...)}`.
