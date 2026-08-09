# Cambios 0.3.1

v0.3.1 — Motor de Lanzamiento (roadmap v0.3.0 · v0.3.1 Disparador Principal). El botón Launch dejó de ser placeholder: la sesión se abre por completo en el navegador resuelto (sesión → global → sistema), con ventana nueva respetada según `openBehavior` y un único canal IPC `workspace:launch` que recorre las pestañas por spawn del navegador (o `shell.openExternal` como último recurso). Se cablearon los dos puntos de entrada (header del Detalle y play de cada card del Hub), se resolvió la deuda de accesibilidad de WorkspaceCard y se cerró un ciclo de imports recién detectado entre `shared` y `entities` (con `import/no-cycle` habilitado de verdad en ESLint).

## 1. Backend — Launcher (spawn respetando la config)

- **`src/main/services/launcherService.js`** (nuevo): `launchWorkspace(workspaceId)`.
  - Resuelve el navegador efectivo con la regla documentada: `sesión.browser ?? (preferences.defaultBrowser !== 'system' ? preferences.defaultBrowser : null)`; `null` = sistema.
  - **Navegador concreto** (id instalado): `child_process.spawn(exe, args)` con `{ detached: true, stdio: 'ignore' }` + `unref()`; args = `[--new-window, url]` (Chromium: chrome/edge/brave/opera/vivaldi) o `[-new-window, url]` (firefox) si `openBehavior === 'new-window'`, o `[url]` para `active-tab`.
  - **Navegador de sistema**: `app.getApplicationInfoForProtocol('https:')` resuelve el ejecutable del predeterminado del SO → mismo spawn con bandera de motor deducida del ejecutable (`getNewWindowFlag`: `firefox` → `-new-window`, resto → `--new-window`). Si no se puede resolver, cae a `shell.openExternal` (único caso sin control de ventana nueva — **bugfix** reportado por el usuario: con "Predeterminado (Sistema)" + ventana nueva la sesión abría en la ventana vigente porque `openExternal` no la fuerza; ahora el predeterminado se spawna igual que un navegador explícito, p. ej. Brave como predeterminado abre en ventana nueva perfectamente).
  - Por URL usa `Promise.allSettled` y devuelve `{ opened, failed }`; los fallos de spawn se cuentan, no abortan el lote. Lanza solo ante errores estructurales: sesión inexistente o navegador configurado no instalado (`Navegador configurado no encontrado`).
- **`src/main/data/workspaceRepository.js`**: nuevo `getWorkspaceById(workspaceId)` (lectura estricta, lanza `Workspace no encontrado`). Era el getter por id que faltaba; lo consume el Launcher.
- **`src/main/services/browserService.js`**: nuevo `getBrowserById(browserId)` que devuelve `{ id, name, path }` del navegador instalado (antes las rutas se descartaban al mapear a `{ id, name }`). Lo consume el Launcher para el spawn.
- **`src/main/ipc/launcherHandler.js`** (nuevo): canal `workspace:launch` (params `workspaceId`, responde `{ success, data, error }` con `data: { opened, failed }`). Registrado en `ipc/index.js`.
- **`src/preload.js`**: expone `launchWorkspace(workspaceId)`.
- **`entities/workspace/api/workspaceIpcApi.js`**: `launchWorkspace(workspaceId)` que convierte `{ success:false }` en throw.

## 2. Frontend — botones de lanzamiento

- **`entities/workspace/hook/useLaunchWorkspace.js`** (nuevo, en `hook/` de la entidad): `{ isLaunching, error, launch }`. Compartido entre Hub y Detalle; `launch(workspaceId?)` acepta el id opcional (el Detalle usa el del hook; el Hub pasa el de cada card) y el guard `typeof id === 'string'` protege contra el evento que React pasa como primer arg en `onClick={launch}`. Loguea con `console.error` y no re-lanza (evita unhandled rejections).
- **`entities/workspace/ui/WorkspaceCard.jsx`**: el botón play (que ya existía como placeholder) queda **cableado** y `disabled` si la card tiene 0 pestañas, con `title` explicativo. Cierra la deuda de accesibilidad del v0.2.3: el play es ahora una acción real, explícita (se mantiene el trade-off estructural `role="button"` + control anidado, documentado).
- **`features/WorkspacesHub/ui/WorkspacesHubView.jsx`** + **`WorkspaceGrid.jsx`**: `useLaunchWorkspace` y prop `onPlay` propagada de la grilla a cada card.
- **`features/WorkspaceDetail/ui/WorkspaceDetailView.jsx`**: el placeholder deshabilitado "Disponible en v0.3" pasa a un `<Button variant="primary" icon="play_arrow">Launch` real, `disabled` mientras `isLaunching` o si la sesión no tiene pestañas.
- **`entities/workspace/api/workspaceLaunch.js`**: `LAUNCH_EMPTY_TABS_TITLE` (regla 9: el título de "sesión sin pestañas" se duplicaba entre `WorkspaceCard` y `WorkspaceDetailView`).

## 3. Pase del @reviewer (ciclos y deuda)

- **Ciclo `shared ↔ entities` detectado y roto**: `useLaunchWorkspace` se movió de `shared/hook/` a `entities/workspace/hook/` (a `shared/` no le corresponde importar de `entities/`). El mismo pase relevó un **ciclo pre-existente** por `useInstalledBrowsers` (en `shared/` importando `getInstalledBrowsers` de entities): también se movió a `entities/workspace/hook/`, actualizando sus consumidores (`useSessionConfig`, `useSettings`) y barrels.
- **`import/no-cycle` habilitado en `.eslintrc.json`** (`"import/no-cycle": "error"`): rules.md §3 lo daba por configurado pero el plugin venía sin la regla activa — justamente por eso el ciclo pasó desapercibido. Ahora el árbol de imports queda auditable en cada lint.
- `shared/index.js` queda con solo hooks genéricos sin dependencia de entidades (`useIconPicker`) y `lib/` de predicates.

## Backend / API (resumen de exponibles de la versión)

Canal IPC nuevo: `workspace:launch`. Se mantiene la forma `{ success, data, error }` con `data/` lanzando, `services/` dejando subir salvo la resolución del navegador de sistema, `ipc/` atrapando y `[x]IpcApi.js` convirtiendo en throw. `.doc/backend.md` y `.doc/config_file.md` sincronizados (canal, `launcherService`, `getBrowserById`, `getWorkspaceById`, API de preload y flujo de lanzamiento). No hubo cambios de esquema en `config.json` (solo el bump de `version`). `.doc/architecture.md` aclara que el spawn de navegadores está en alcance (el de apps nativas sigue fuera).

## Estado

- Lo hecho: `Plan/to_do.md` con los items `v0.3.1` en `[x]` (botón Launch prominente en el Detalle + apertura IPC por `shell.openExternal`/spawn), la deuda de accesibilidad de WorkspaceCard resuelta al cablear el play real, el bugfix del navegador de sistema con ventana nueva verificado por el usuario ("funciona", Brave como predeterminado abre en ventana nueva) y el pase del reviewer aplicado (ciclos + import/no-cycle + string centralizado). Verificación de lint (con la regla de ciclos activa) y build del renderer + bundle main/preload vía esbuild — todos OK.
- Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*`, `AGENTS.md` (sección "Fase actual") actualizado, y `.doc/*` verificados contra el código.