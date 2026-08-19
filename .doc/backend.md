# Backend — Arquitectura (v0.5.4)

El proceso main de Electron sigue una arquitectura por capas (Controlador-Servicio-Repositorio). El renderer **nunca** llega a Node.js: todo pasa por `preload.js` → `ipc/` → `services/` → `data/`.

## Capas

### 1. `src/preload.js` (El Puente)
Expone `window.uloomApi` vía `contextBridge`. No transforma datos: reexpone `ipcRenderer.invoke` tal cual.

API expuesta (v0.2.1, + navegador y preferencias en v0.2.2, + borrado y metadatos web en v0.2.4, + lanzamiento en v0.3.1, + navegador del sistema en v0.3.2, + exportación y limpieza en v0.4.1, + importación en v0.4.2, + duplicación en v0.5.3, + historial de pestañas en v0.5.4):
- `uloomApi.getConfig()` → invoca el canal `config:get`. Resuelve con `{ success, data, error }`.
- `uloomApi.createWorkspace(input)` → invoca el canal `workspace:create`.
- `uloomApi.duplicateWorkspace(sourceId, input)` → invoca el canal `workspace:duplicate`.
- `uloomApi.updateWorkspace(workspace)` → invoca el canal `workspace:update`.
- `uloomApi.deleteWorkspace(workspaceId)` → invoca el canal `workspace:delete`.
- `uloomApi.launchWorkspace(workspaceId)` → invoca el canal `workspace:launch`.
- `uloomApi.getInstalledBrowsers()` → invoca el canal `browser:list`. Devuelve los navegadores instalados detectados.
- `uloomApi.getSystemDefaultBrowser()` → invoca el canal `browser:system`. Resuelve el navegador del SO si es del catálogo; `null` en otro caso.
- `uloomApi.updatePreferences(partial)` → invoca el canal `config:updatePreferences`.
- `uloomApi.getPageMetadata(url)` → invoca el canal `page:metadata`. Devuelve `{ title, favicon }` (favicon como data URL; soft-fallback a `null`).
- `uloomApi.exportWorkspace(workspaceId)` → invoca el canal `portability:exportWorkspace`. Abre el diálogo de guardado y escribe la sesión como `.json`; resuelve `{ canceled, filePath }`.
- `uloomApi.exportAll()` → invoca el canal `portability:exportAll`. Respaldo completo de todas las sesiones; resuelve `{ canceled, filePath }`.
- `uloomApi.clearMetadataCache()` → invoca el canal `workspace:clearMetadataCache`. Resuelve `{ cleared }`.
- `uloomApi.clearAllWorkspaces()` → invoca el canal `workspace:clearAll`. Vacía `workspaces` preservando `preferences`; resuelve `{ deleted }`.
- `uloomApi.importFromFile()` → invoca el canal `portability:import`. Abre el diálogo de apertura, valida el `.json` y reconstruye sesiones; resuelve `{ canceled, imported }`.
- `uloomApi.getTabHistory()` → invoca el canal `tabHistory:get`. Devuelve el historial de pestañas usadas (v0.5.4).
- `uloomApi.clearTabHistory()` → invoca el canal `tabHistory:clear`. Vacía el historial; resuelve `{ cleared }`.

### 2. `src/main/ipc/` (Controladores)
`registerIpcHandlers()` (en `ipc/index.js`) delega el registro en handlers por dominio: `workspaceHandler.js` (canales del dominio workspace), `browserHandler.js`, `preferencesHandler.js`, `pageHandler.js`, `launcherHandler.js`, `portabilityHandler.js` (exportación e importación) y `tabHistoryHandler.js` (historial de pestañas usadas, v0.5.4). Todo handler:
- Llama al servicio correspondiente.
- Envuelve en `try/catch` — ningún handler puede dejar escapar una excepción.
- Responde siempre con la forma `{ success: boolean, data?: any, error?: string }` (regla 7 de `rules.md`); desde v0.4.4 el handler `portability:import` suma `code?: string` a la respuesta de error (el código del fallo de portabilidad, ver `PORTABILITY_ERROR_CODES`) para que el frontend lo mapee a un mensaje localizado.

Canales registrados (v0.2.1 + v0.2.2, agrupados por dominio en v0.2.3, + metadata web en v0.2.4, + lanzamiento en v0.3.1, + navegador del sistema en v0.3.2, + exportación y limpieza en v0.4.1, + importación en v0.4.2, + duplicación en v0.5.3, + historial en v0.5.4):
| Canal | Params | Respuesta `data` |
|---|---|---|
| `config:get` | — | `Config` |
| `workspace:create` | `{ name, description?, icon? }` | `Workspace` (creado) |
| `workspace:duplicate` | `sourceId`, `{ name, description?, icon? }` | `Workspace` (clon nuevo) |
| `workspace:update` | `Workspace` (completo) | `Workspace` (persistido) |
| `workspace:delete` | `workspaceId` | `null` |
| `workspace:launch` | `workspaceId` | `{ opened, failed }` (URLs abiertas / fallidas) |
| `workspace:clearMetadataCache` | — | `{ cleared: number }` (favicons removidos de todas las pestañas) |
| `workspace:clearAll` | — | `{ deleted: number }` (sesiones eliminadas; preserva `preferences`) |
| `page:metadata` | `url` | `{ title, favicon }` (favicon data URL; soft-fallback a `null`) |
| `browser:list` | — | `Array<{ id, name }>` (navegadores instalados) |
| `browser:system` | — | `{ id, name }` navegador del SO si es del catálogo, o `null` |
| `config:updatePreferences` | `Partial<Preferences>` | `Preferences` (merge persistido) |
| `portability:exportWorkspace` | `workspaceId` | `{ canceled: boolean, filePath?: string }` |
| `portability:exportAll` | — | `{ canceled: boolean, filePath?: string }` |
| `portability:import` | — | `{ canceled: boolean, imported?: Workspace[] }` — lista final del catálogo persistido |
| `tabHistory:get` | — | `TabHistoryEntry[]` (historial de pestañas usadas, ordenado más usadas primero) |
| `tabHistory:clear` | — | `{ cleared: number }` (entradas del historial removidas) |

### 3. `src/main/services/` (Lógica de Negocio)
- `workspaceService.js`: `getConfig()` (config completa normalizada), `createWorkspace()` (genera id con randomUUID, arma `tabs: []`, `openBehavior: 'active-tab'` y `browser: null`), `duplicateWorkspace(sourceId, input)` (v0.5.3: lee la sesión fuente con `getWorkspaceById`, clona sus `tabs` con **ids nuevos** y copia `openBehavior`/`browser` en un workspace nuevo con id nuevo y los datos básicos provistos — la fuente nunca se modifica), `updateWorkspace()` (**v0.5.4:** lee la sesión previa con `getWorkspaceById`, persiste el update estricto y registra en el historial las pestañas con URL nueva por diff — el alta de pestañas no tiene canal propio, va por `workspace:update`; editar/borrar no re-registra; el registro es best-effort y nunca condiciona el resultado del update), `deleteWorkspace()` (delega; baja estricta), `clearMetadataCache()` (delega en el repositorio; devuelve la cantidad de favicons removidos) y `deleteAllWorkspaces()` (delega; devuelve la cantidad de sesiones eliminadas preservando `preferences`).
- `portabilityService.js` (nuevo en v0.4.1, + import en v0.4.2, + códigos de error en v0.4.4): `exportWorkspace(workspaceId)` — lee la sesión por id (lectura estricta), arma el payload wrapper `{ app, kind: 'workspace', schemaVersion, exportedAt, data: [workspace] }` y abre `dialog.showSaveDialog` con nombre sugerido `<slug-del-nombre>.json`; `exportAll()` — arma el wrapper `{ app, kind: 'backup', ..., data: [todos los workspaces] }` y lo guarda como `uloom-backup-YYYY-MM-DD.json`. Ambas escriben con `fs.writeFileSync` (pretty-print 2) y devuelven `{ canceled, filePath }`; cancelar el diálogo no es un error. `importFromFile()` — abre `dialog.showOpenDialog` (filtro `.json`, cancel ≠ error → `{ canceled: true }`), lee y valida el wrapper (`app: 'uloom'`, `kind` en `workspace|backup`, `schemaVersion` string, `data` array de workspaces con `name` string), normaliza cada sesión y delega la escritura en `workspaceRepository.importWorkspaces` con `replace: kind === 'backup'`. Devuelve `{ canceled, imported }` (lista final persistida). **Códigos de error (v0.4.4):** toda falla de importación adjunta un `code` al `Error` (constante `PORTABILITY_ERROR_CODES`): `INVALID_JSON`, `NOT_ULOOLM_FILE`, `UNSUPPORTED_KIND`, `INVALID_SCHEMA_VERSION`, `INVALID_WORKSPACES`, `READ_ERROR` (lectura del archivo) y `PERSIST_ERROR` (escritura del catálogo). El handler IPC los propaga y el frontend mapea cada código a un mensaje localizado en su toast.
- `launcherService.js`: `launchWorkspace(workspaceId)` — resuelve el navegador efectivo de la sesión (sesión → global → sistema, ver flujo más abajo) y abre **todas** las `tab.url` en **un solo spawn** del ejecutable. Tanto un **navegador concreto** como el **predeterminado del sistema** (resuelto con `resolveSystemBrowser` de `browserService` a su ejecutable) se abren por `child_process.spawn` (`detached`, `stdio: 'ignore'`, `unref()`) con todas las URLs como argumentos: con `openBehavior === 'new-window'` antepone la bandera de ventana nueva del motor (`--new-window` en Chromium — chrome/edge/brave/opera/vivaldi — y `-new-window` en firefox; para el navegador de sistema la bandera sale del id del catálogo cuando aplica, o de la heurística por motor del ejecutable cuando no) y el conjunto se abre en una sola ventana (cada URL como pestaña); en `active-tab` pasa solo las URLs (pestañas en la ventana vigente). Un solo spawn evita que cada pestaña abra una ventana propia en `new-window` y la race de spawns paralelos en `active-tab`. Si el predeterminado del sistema no puede resolverse a un ejecutable, cae a `shell.openExternal` por URL (único caso sin control de ventana nueva, y el único que puede devolver fallos parciales). Devuelve `{ opened, failed }` (todo o nada en el spawn); lanza ante errores estructurales (sesión inexistente, navegador configurado no instalado o spawn que falla). **v0.5.4:** al abrir con éxito registra las URLs lanzadas en el historial (`recordTabsBestEffort`; en el fallback de sistema solo las fulfilled — una sesión que falla estructuralmente no registra nada y un fallo del historial nunca convierte el launch en error).
- `tabHistoryService.js` (nuevo en v0.5.4): `getTabHistory()` (devuelve el historial normalizado y ordenado), `recordTabs(tabs)` (registra pestañas usadas con el mapeo centralizado `tabToHistoryEntry`) y `recordTabsBestEffort(tabs)` (mismo registro pero best-effort: atrapa errores y solo loguea — lo usan `workspaceService.updateWorkspace` por diff de URLs nuevas y `launcherService.launchWorkspace` al abrir) y `clearTabHistory()` (vacía el historial; devuelve la cantidad removida).
- `browserService.js`: `getInstalledBrowsers()` — detecta navegadores instalados con un probe de rutas típicas (Chrome, Edge, Firefox, Brave, Opera, Vivaldi) ancladas en `PROGRAMFILES`/`PROGRAMFILES(X86)`/`LOCALAPPDATA` mediante `fs.existsSync`. Solo Windows; en otras plataformas devuelve `[]`. `getBrowserById(id)` — devuelve `{ id, name, path }` (el ejecutable resuelto) de un navegador instalado, o `null`. Lo consume el Launcher para el spawn. `resolveSystemBrowser()` — **resolución única y compartida** del navegador predeterminado del SO (`app.getApplicationInfoForProtocol('https:')`): devuelve `{ id, name, path }` con `id: null` si el default no es del catálogo (mapeo por basename del ejecutable), o `null` si no es Windows o no se pudo resolver. Lo usan el launcher (spawn) y la UI. `getSystemDefaultBrowser()` — envuelve `resolveSystemBrowser()` y devuelve `{ id, name }` del catálogo o `null` (para el ícono del selector).
- `preferencesService.js`: `getPreferences()` y `updatePreferences(partial)` (merge parcial, delega en el repositorio).
- `pageService.js`: `fetchPageMetadata(url)` — trae el `<title>` y el favicon del sitio con `net.fetch` (session default, `AbortController` de 4s, cap 1MB al HTML y ~32KB al favicon, favicon como **data URL**). Regex tolerante al orden de atributos para `<link rel="icon">`, resuelve URLs absolutas y cae a `/favicon.ico` si no hay link. **Soft-fallback**: cualquier fallo devuelve `null` en los campos, no lanza.

### 4. `src/main/data/` (Repositorios)
- `configStore.js`: única capa que toca el archivo. `readConfig()` valida la raíz (existencia, `workspaces` array, corrupción → default) y normaliza `preferences`; los workspaces pasan **crudos** (la normalización de la entidad vive en su repositorio). Expone también `writeConfig()`, `normalizePreferences()` y `defaultConfig()`/`APP_VERSION` (versión del esquema; desde v0.5.4 el default incluye `tabHistory: []`).
- `workspaceRepository.js`: dueño de la entidad workspace. `normalizeWorkspace()` (rellena `tabs` como array, `openBehavior: 'active-tab'` y `browser: null` — migración de configs viejas), `getConfig()` (config completa con workspaces normalizados), `readWorkspaces()`, `getWorkspaceById()` (lectura estricta, usado por el Launcher), `addWorkspace()`, `updateWorkspace()` (update estricto), `deleteWorkspace()` (baja estricta), `clearMetadataCache()` (remueve `Tab.favicon` de todas las pestañas y persiste; devuelve la cantidad), `deleteAllWorkspaces()` (vacía `workspaces` preservando `preferences`; devuelve la cantidad) e `importWorkspaces(workspaces, { replace })` (v0.4.2: normaliza la lista; con `replace: true` deja las sesiones locales fuera — restauración de respaldo, preserva `preferences`; con `replace: false` agrega las importadas regenarando el id de las que colisionen con una sesión local; persiste y devuelve la lista final).
- `tabHistoryRepository.js` (nuevo en v0.5.4): dueño del historial de pestañas. `normalizeTabHistory()` (garantiza array, descarta entradas sin URL, rellena defaults), `readTabHistory()` (historial normalizado y ordenado: `count` desc, desempate `lastUsedAt` desc), `recordTabs(tabs)` (upsert por URL — URL nueva crea entrada con `count: 1`; existente incrementa `count`, actualiza `lastUsedAt` y refresca `name`/`icon`/`favicon` — ordena y aplica el cap `MAX_TAB_HISTORY = 20` con evicción de las menos usadas) y `clearTabHistory()` (vacía y devuelve la cantidad removida).
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

### Duplicar sesión (v0.5.3)
```
Detalle: useDuplicateWorkspace (features) → form precargado con la fuente + nombre inferido `root (count)`
   → useWorkspaces.duplicateWorkspace(sourceId, { name, description?, icon? })
   → workspaceIpcApi.duplicateWorkspace(sourceId, input)
   → preload → ipc 'workspace:duplicate' → workspaceHandler
   → workspaceService.duplicateWorkspace: getWorkspaceById(sourceId)
        → clone { id: randomUUID, name/description/icon provistos,
                  tabs: source.tabs clonadas con id randomUUID cada una,
                  openBehavior/browser copiados } — la fuente nunca se modifica
   → workspaceRepository.addWorkspace → persiste
   → respuesta: workspace clonado; el caller lo agrega al estado y cierra el modal
```

### Actualizar (agregar/editar/eliminar pestaña)
Cada mutación de pestañas reescribe el **workspace completo** (todo el array `tabs`) vía `workspace:update`. El update es estricto, por lo que la sesión debe existir en disco (primero se crea).
```
useTabModal / useDeleteTab → useWorkspaces.addTab / updateTab / deleteTab
   → mutateWorkspace (líder único de escritura, ver abajo)
   → workspaceIpcApi.updateWorkspace(next)
   → ipc: 'workspace:update' → workspaceService.updateWorkspace → repository.updateWorkspace
   → si el id no existe: throw → IPC { success:false } → throw en renderer → console.error en la vista
   → respuesta: el workspace persistido reemplaza al estado local
```
Estrategia **pesimista**: el renderer espera la respuesta del disco como fuente de verdad. No hay optimismo ni rollback.

### Eliminar sesión
```
useDeleteWorkspace → useWorkspaces.deleteWorkspace(id)  (serializado en writeChainRef)
   → workspaceIpcApi.deleteWorkspace(id)
   → ipc: 'workspace:delete' → workspaceService.deleteWorkspace → repository.deleteWorkspace (splice estricto)
   → si el id no existe: throw → IPC { success:false } → throw en renderer → console.error en la vista
   → respuesta: el workspace se elimina del estado; el Detalle navega al Hub
```

### Metadatos web (`page:metadata`)
```
useTabForm (debounce 400ms sobre URL válida + flag de cancelación) → getPageMetadata(url)
   → preload → ipc 'page:metadata' → pageService.fetchPageMetadata(url)
   → net.fetch con timeout/caps → { title, favicon (data URL) } (soft-fallback null)
   → el hook expone suggestedName + autoFavicon; el submit persiste name/favicon del form
```

### Líder único de escritura (v0.2.3, renderer)
Cada mutación de un workspace — pestañas y configuración por sesión — pasa por el **mismo** `mutateWorkspace` del estado global (`useWorkspaceState`). Serializa las escrituras en una cola de promesas y construye cada snapshot sobre el último workspace **persistido** por id (ref por workspace, no React state que puede quedar atrás). Esto elimina la raza cross-feature de v0.2.2, donde un guardado de configuración (`useSessionConfig`) y un alta/baja de pestaña podían pisar snapshots parciales en disco. `useSessionConfig` ya no tiene cola propia: delega en el líder.

## Frontend API (`src/renderer/entities/workspace/api/`)

- `workspaceIpcApi.js` consume `window.uloomApi` y convierte `{ success: false, error }` en `throw new Error(error)`. Expone `getConfig`, `createWorkspace`, `duplicateWorkspace`, `updateWorkspace`, `deleteWorkspace`, `launchWorkspace`, `getInstalledBrowsers`, `getSystemDefaultBrowser`, `updatePreferences`, `getPageMetadata`, `clearMetadataCache` y `clearAllWorkspaces`.
- `tabHistoryIpcApi.js` (nuevo en v0.5.4): `getTabHistory()` y `clearTabHistory()` — misma conversión de `{ success: false }` en throw; el clear devuelve `{ cleared }`.
- `portabilityIpcApi.js` (nuevo en v0.4.1, + import en v0.4.2, + códigos en v0.4.4): `exportWorkspace(workspaceId)`, `exportAll()` e `importFromFile()` — misma conversión de `{ success: false }` en throw; las exportaciones devuelven `{ canceled, filePath }` y el import `{ canceled, imported }` (cancelar el diálogo no es un error). Desde v0.4.4, `importFromFile` adjunta el `code` de error del backend al `Error` lanzado (cuando la respuesta lo trae) para que el hook mapee el fallo a un mensaje localizado.
- `workspaceIcons.js` expone `WORKSPACE_ICONS` (catálogo de iconos Material Symbols para sesiones) y `WORKSPACE_ICON_PREVIEW_COUNT`.
- `workspaceLaunch.js` (nuevo) expone los catálogos estáticos de lanzamiento: `SYSTEM_BROWSER`, `SYSTEM_BROWSER_LABEL`, `DEFAULT_BROWSER_LABEL`, `LAUNCH_EMPTY_TABS_TITLE` y `OPEN_BEHAVIOR_OPTIONS` (con `labelKey`), más los builders `buildOpenBehaviors(t)` (resuelve `labelKey` con el traductor del idioma activo), `getBrowserNameById` y `buildBrowserOptions`. Los labels son claves del diccionario i18n (`shared/lib/i18n`): los consumidores resuelven el texto con `t(clave)` (v0.4.3).
- `workspaceLabels.js` expone las claves i18n de acciones compartidas entre Hub y Detalle: `ADD_TAB_LABEL`, `SAVE_CHANGES_LABEL`, `DELETE_TAB_LABEL`, `EXPORT_LABEL`, `IMPORT_LABEL` e `IRREVERSIBLE_ACTION_HINT` (valores del diccionario `labels.*`).
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
useInstalledBrowsers (entities, hook de entidad) → getInstalledBrowsers → preload → ipc 'browser:list'
   → browserService.getInstalledBrowsers → probe de rutas del sistema
```
Se consume desde el Detalle (navegador por sesión) y desde Configuración (preferencia global).

### Navegador del sistema (`browser:system`)
```
useSystemDefaultBrowser (entities, hook de entidad) → useCachedQuery (shared, promesa cacheada a nivel módulo — 1 consulta por sesión de app)
   → getSystemDefaultBrowser → preload → ipc 'browser:system'
   → browserService.getSystemDefaultBrowser → resolveSystemBrowser (centraliza app.getApplicationInfoForProtocol('https:'))
       → basename del exe → id del catálogo; si no es del catálogo → null
```
El renderer usa el id resuelto para mostrar el ícono del default real cuando la preferencia es
`system` (Detalle con "Predeterminado" sin override y Configuración). `null` → ícono genérico.
La consulta es barata (registro del OS) y cacheada por sesión; el trade-off es que si el default
del SO cambia con la app abierta, el ícono queda fijo hasta reiniciar.

### Preferencia global / herencia
- `preferences.defaultBrowser` se escribe con `config:updatePreferences` (merge parcial desde Configuración → Preferencias).
- Resolución (implementada por el Launcher en v0.3.1): `navegador_final = sesión.browser ?? (preferences.defaultBrowser !== 'system' ? preferences.defaultBrowser : null)`; `null` = decide el SO (→ `shell.openExternal`).

### Lanzar sesión (`workspace:launch`, v0.3.1)
```
Detalle: useLaunchWorkspace.launch()   /   Hub: useLaunchWorkspace.launch(workspaceId)  (entities/hook)
   → workspaceIpcApi.launchWorkspace(id) → preload → ipc 'workspace:launch' → launcherHandler
   → launcherService.launchWorkspace(id): getConfig + getWorkspaceById (lectura estricta)
       → resuelve navegador (sesión → global → sistema)
       → UN spawn(exe, [bandera-ventana-nueva?] + urls...) detached/unref con todas las URLs
→ navegador de sistema: browserService.resolveSystemBrowser → su ejecutable
            → mismo spawn único con bandera por id (catálogo) o heurística de motor; si no resuelve → shell.openExternal por URL
   → { opened, failed } → el botón se deshabilita mientras isLaunching y si la sesión no tiene tabs
```
El `openBehavior` se respeta tanto con el navegador explícito como con el predeterminado del sistema resuelto a ejecutable (bandera del motor): `new-window` abre el conjunto completo en una sola ventana nueva y `active-tab` como pestañas en la ventana vigente; solo si el predeterminado no puede resolverse se cae a `shell.openExternal` por URL y el SO decide. En el spawn el resultado es todo o nada (éxito → `opened = N`; fallo → throw → `{ success: false }`); `failed > 0` solo puede darlo el fallback de `openExternal` (fallos parciales por URL). Los errores estructurales (sesión o navegador inexistentes) se convierten en `{ success: false }`. Desde v0.4.4 el renderer emite feedback visual: error → toast de error (`launch.error`) y `failed > 0` → toast de advertencia con la cantidad (`launch.partialFailure`).

### Exportar sesión / todo (`portability:*`, v0.4.1)
```
Detalle: useExportWorkspace.exportSession()   /   Configuración: usePortability.exportAll
   → entities/workspace/api/portabilityIpcApi (exportWorkspace | exportAll)
   → preload → ipc 'portability:exportWorkspace' | 'portability:exportAll' → portabilityHandler
   → portabilityService.exportWorkspace(id) | exportAll()
        → wrapper { app: 'uloom', kind: 'workspace'|'backup', schemaVersion, exportedAt, data }
        → dialog.showSaveDialog (defaultPath slug-<nombre>.json | uloom-backup-YYYY-MM-DD.json)
        → fs.writeFileSync (pretty-print 2)
   → { canceled, filePath } (cancel ≠ error; `canceled: true`)
```
El renderer solo dispara la acción; el diálogo nativo vive en el proceso main. Desde v0.4.4 la exportación emite toast de éxito (`export.success` / `exportSession.success`) cuando el usuario no cancela el diálogo y toast de error localizado ante un fallo.

### Importar sesiones (`portability:import`, v0.4.2, + feedback en v0.4.4)
```
Configuración → Sesiones: usePortability.importSessions
   → useWorkspaces.importWorkspaces (serializado en writeChainRef del estado global)
   → entities/workspace/api/portabilityIpcApi.importFromFile
   → preload → ipc 'portability:import' → portabilityHandler
   → portabilityService.importFromFile()
        → dialog.showOpenDialog (filtro .json; cancel ≠ error → { canceled: true })
        → lee el archivo y valida el wrapper (app 'uloom', kind workspace|backup,
          schemaVersion string, data array de workspaces con name)
        → workspaceRepository.importWorkspaces(workspaces, { replace: kind === 'backup' })
             → replace: catálogo = lista importada (restauración de respaldo, preserva preferences)
             → append: agrega las importadas; id colisionante → randomUUID nuevo
        → { canceled, imported } (lista final persistida)
   → éxito: useWorkspaceState rehidrata el catálogo y el ref de última escritura con `imported`
        → toast de éxito con el conteo importado (import.success; el hook del estado devuelve
          { canceled, imported } para distinguir la cancelación del éxito real)
   → error de validación del archivo: { success: false, error, code } → throw (portabilityIpcApi
        adjunta `code` al Error) → usePortability mapea code → clave i18n → toast de error
        (fallback a import.errorGeneric); el console.error queda como log dev
```
Semántica por `kind`: `workspace` (sesión individual) **agrega** sin tocar lo existente; `backup` (respaldo completo) **reemplaza** todas las sesiones locales preservando `preferences`.

### Limpieza (v0.4.1)
```
Configuración → Sesiones: usePortability.clearCache / deleteAll (doble ConfirmDialog)
   → workspaceIpcApi.clearMetadataCache | clearAllWorkspaces
   → preload → ipc 'workspace:clearMetadataCache' | 'workspace:clearAll' → workspaceHandler
   → workspaceService → workspaceRepository.clearMetadataCache() | deleteAllWorkspaces()
        → clearMetadataCache: recorre tabs, remueve Tab.favicon (data URL) y persiste → { cleared }
        → deleteAllWorkspaces: workspaces = [], conserva preferences → { deleted }
   → el estado global (useWorkspaceState) sincroniza tras cada operación:
        clearMetadataCache → reconstruye latestByWorkspaceRef sin favicons y setWorkspaces
        clearAllWorkspaces → limpia el ref y setWorkspaces([])
```
Ambas mutaciones se serializan en el líder único de escritura (`writeChainRef`) del estado global, como el resto de las escrituras.

### Historial de pestañas (v0.5.4)
El historial es un registro liviano **separado de las sesiones** (`config.tabHistory`, cap 20). Se alimenta desde el backend en dos puntos:
```
Alta individual:  useTabModal.onSubmitTab → addTab → mutateWorkspace → workspace:update
Alta en lote:      useTabModal.onSubmitTabs → addTabs → mutateWorkspace → workspace:update
   (una sola escritura appende el lote; el diff detecta todas las URLs nuevas juntas)
   → workspaceService.updateWorkspace: lee el previo (getWorkspaceById), persiste,
     calcula URLs NUEVAS por diff (en next y no en prev) → recordTabsBestEffort
Lanzamiento:      launcherService.launchWorkspace al abrir con éxito
   → recordTabsBestEffort(todas las URLs lanzadas); en el fallback openExternal solo las fulfilled
   → tabHistoryRepository.recordTabs: upsert por URL + count/lastUsedAt + cap 20
```
La UI lo consume en el modal de pestaña (lectura + selección múltiple) y en Configuración (limpieza):
```
Modal de pestaña (Hub y Detalle): useTabFormModal (composite) → useTabHistory({ isActive, existingUrls })
   → tabHistoryIpcApi.getTabHistory → preload → ipc 'tabHistory:get'
   → tabHistoryService.getTabHistory → repository.readTabHistory
   (carga al montar la vista y refresca en cada apertura del modal, sin limpiar la
   lista previa; fallo de carga = soft-fallback, queda el último estado conocido)
   modo 'history': filas con checkbox (visibleEntries, excluye URLs ya presentes) → confirm arma las Tab[]
   con buildTabsFromHistory (shared/lib) → onSubmitTabs → addTabs (una escritura en disco)
   el segment Historial se deshabilita cuando no hay nada para mostrar, decidido antes de abrir el modal
Configuración → Sesiones: usePortability.clearHistory → useWorkspaces.clearTabHistory
   → tabHistoryIpcApi.clearTabHistory → preload → ipc 'tabHistory:clear' → service → repository
   → { cleared } → toast de éxito/error (resultado no visible en Settings, regla 10)
```

## Tipos
Los `@typedef` (`Workspace`, `Tab`, `Config`, `TabHistoryEntry`) viven centralizados en `src/renderer/shared/types.js`. El backend los referencia vía JSDoc `@typedef {import(...)}`.
