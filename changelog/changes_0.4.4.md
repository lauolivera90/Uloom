# Cambios 0.4.4

v0.4.4 — Feedback visual. La app deja de loguear errores a ciegas: nace un **sistema de toast** (provider + context en shared + widgets presentacionales, solo tokens) y se aplica en todas las acciones de usuario que hoy solo hacían `console.error`. La **importación de sesiones** gana control de errores por caso: el backend adjunta códigos de error estructurados (`PORTABILITY_ERROR_CODES`) que el frontend mapea a mensajes localizados, y el éxito confirma con conteo. Los toasts son descriptivos del estado del programa (éxito/error/advertencia) y conviven con los `console.error` como log dev.

## 1. Sistema de toast

- **`shared/hook/useToast.js`**: `ToastContext` + `useToast()` → `{ toast({ variant, message, duration? }), dismiss(id) }`. Contexto en shared (mismo patrón que `I18nContext`) para que widgets, features y la app lo consuman sin ciclos de capas.
- **`app/hook/useToastState.js`**: estado de la lista, auto-cierre por id (default 4s) con timers en ref y cleanup total al desmontar (regla 2.2); tope de 4 toasts visibles (descarta el más viejo **y limpia su timer** — hallazgo H4 del @reviewer); ids por contador.
- **`app/ToastProvider.jsx`**: provee `{ toast, dismiss }` con value **memoizado** (hallazgo H1 del @reviewer: evita re-render de consumidores en cada alta/baja, alineado con `LanguageProvider`) y renderiza el viewport. Cableado en `App.jsx` dentro de `LanguageProvider` y fuera de `WorkspaceProvider` (así `useWorkspaceState` también puede tostear).
- **`widgets/ui/Toast/Toast.jsx`** + **`widgets/ui/ToastViewport/ToastViewport.jsx`**: presentacionales. Viewport fijo `bottom-6 right-6 z-[60]` (por encima de modales) con `aria-live="polite"`; cada toast es `flex items-center gap-3 rounded-lg shadow-xl` con `duration-slow animate-in fade-in slide-in-from-bottom-2`, ícono Material Symbols líder, mensaje `text-sm font-medium` y botón de cierre con `aria-label` (`toast.dismiss`). **Variantes solo tokens:** `success` → `bg-primary`/`text-on-primary` (confirmación = acción), `error` → `bg-error`/`text-on-error`, `warning` → `bg-tertiary`/`text-on-tertiary`, `info` → `bg-surface`/`text-text`/`border-border`. Iconos `check_circle`/`error`/`warning`/`info`. **Excepción documentada (H2):** el botón de cierre sobre fills de color es un `<button>` bespoke con `hover:bg-overlay/10`, `rounded-md` y focus `ring-current` — el `focusRing` estándar y el hover de `IconButton` no contrastan bien sobre fills saturados (documentado en `design.md` §3).
- **Barrels**: `shared/index.js` (`useToast`, `ToastContext`), `widgets/ui/index.js` + `widgets/index.js` (`Toast`, `ToastViewport`), `app/index.js` (`ToastProvider`).

## 2. Control de errores en importación (por caso)

- **`src/main/services/portabilityService.js`**: nueva constante `PORTABILITY_ERROR_CODES` (`INVALID_JSON`, `NOT_ULOOLM_FILE`, `UNSUPPORTED_KIND`, `INVALID_SCHEMA_VERSION`, `INVALID_WORKSPACES`, `READ_ERROR`, `PERSIST_ERROR`) y helper `createPortabilityError(code, message)` que adjunta el `code` al `Error`. Los errores de validación del wrapper, de lectura (`fs.readFileSync`) y de escritura del catálogo (`importWorkspaces`) ahora se lanzan con código.
- **`src/main/ipc/portabilityHandler.js`**: el handler `portability:import` propaga `code` en la respuesta `{ success, data, error, code }` cuando el error lo trae; el resto del contrato IPC no cambia (regla 7).
- **`src/renderer/entities/workspace/api/portabilityIpcApi.js`**: `importFromFile` adjunta `error.code` al `Error` lanzado al convertir `{ success: false }`.
- **`useWorkspaceState.importWorkspaces`** pasa a devolver `{ canceled, imported }` (el número de sesiones importadas; antes colapsaba cancelación y éxito en `{ imported: 0 }`) para que el caller distinga la cancelación del diálogo del éxito real.
- **`usePortability.importSessions`**: mapea `error.code → clave i18n` (`IMPORT_ERROR_KEYS`, fallback `import.errorGeneric`) → toast de error; en éxito (si no canceló) → toast `import.success` con plural `{count}`.

## 3. Toasts aplicados (feedback descriptivo del estado)

Reemplazan los `console.error` de acciones de usuario; el `console.error` queda como log dev:

| Acción | Éxito | Error |
|---|---|---|
| Importar (Configuración → Sesiones) | `import.success` ({count}) | mapeado por código (`import.errorInvalidJson`, `errorNotUloom`, `errorUnsupportedKind`, `errorInvalidSchema`, `errorInvalidSessions`, `errorRead`, `errorPersist`, genérico) |
| Exportar todo | `export.success` | `export.error` |
| Borrar caché | `cache.success` | `cache.error` |
| Eliminar todas las sesiones | `deleteAll.success` | `deleteAll.error` |
| Eliminar pestaña / sesión | — (feedback visual inmediato) | `deleteTab.error` / `deleteWorkspace.error` |
| Lanzar sesión | — | `launch.error` + advertencia `launch.partialFailure` ({failed}) si parte de las pestañas fallan |
| Exportar sesión (Detalle) | `exportSession.success` | `exportSession.error` |
| Guardar form (sesión/pestaña) | — (cierre del modal) | `save.error` |
| Navegador predeterminado global | — | `save.preferencesError` |
| Load inicial de config | — | `load.error` |

- **`useConfirmAction`** (shared) gana la prop `errorKey` (clave i18n) y emite el toast de error localizado además del `console.error`; la usan `useDeleteTab`, `useDeleteWorkspace` y el delete-all de `usePortability`. `confirm` sigue devolviendo `false` sin lanzar y el diálogo solo cierra ante éxito.
- **`useLaunchWorkspace`**: toast de error (`launch.error`) y advertencia parcial (`launch.partialFailure`) manteniendo el `error` state para feedback inline futuro.
- **`useExportWorkspace`**: toast de éxito solo si el usuario no canceló el diálogo; toast de error ante fallo.
- **`useWorkspaceFormModal` / `useTabModal`**: toast `save.error` en el catch y re-lanzan (el `.catch` de la vista sigue logueando).
- **`useSettings.setDefaultBrowser`**: toast `save.preferencesError`.
- **`useWorkspaceState`** load inicial: toast `load.error` (con cancel flag del efecto).

**Sin toast** (interno/soft-fallback, no son errores de acción de usuario): `useTabForm` (fetch de metadatos, falla en silencio a null), `useCachedQuery` (consulta cacheada) y `preload.js`. **`useSessionConfig`** mantiene su error inline en `WorkspaceConfig` (feedback contextual, sin toast redundante).

## 4. i18n (es/en)

22 claves nuevas en `shared/lib/i18n/es.js` y `en.js` con paridad completa: `toast.dismiss`, `import.success` (plural `{count}`) + 8 errores de importación, `export.success`/`export.error`, `exportSession.success`/`exportSession.error`, `cache.success`/`cache.error`, `deleteAll.success`/`deleteAll.error`, `deleteTab.error`, `deleteWorkspace.error`, `launch.error`, `launch.partialFailure` (plural `{failed}`), `save.error`, `save.preferencesError` y `load.error`. Los mensajes del backend (dev-facing) siguen sin traducirse (regla 9).

## Backend / API (resumen de exponibles de la versión)

- `portabilityService.js`: + `PORTABILITY_ERROR_CODES` (constante exportada) y códigos adjuntos a los errores de importación (validación, lectura y persistencia).
- `portabilityHandler.js`: la respuesta de error de `portability:import` suma `code` opcional.
- `portabilityIpcApi.js`: `importFromFile` propaga `code` en el throw.
- `useWorkspaceState.importWorkspaces`: devuelve `{ canceled, imported }`.
- `SCHEMA_VERSION` del formato de exportación sigue en `'0.4.1'` (el wrapper de datos no cambió; solo el contrato de error del canal). `APP_VERSION` del esquema de config sube a `0.4.4`. `.doc/backend.md`/`.doc/config_file.md` reflejan el bump (header + default) y `.doc/backend.md` documenta el nuevo contrato con `code`.

## Docs

- `.doc/backend.md`: códigos de error del dominio portabilidad (service + handler + Frontend API), flujo de import con feedback, notas de toasts en launch/export.
- `.doc/design.md` §3: widget `Toast`/`ToastViewport` (variantes con tokens, posición, motion, auto-cierre, close bespoke documentado como excepción).
- `.doc/architecture.md`: árbol con `ToastProvider.jsx`, `useToastState.js`, `useToast.js`, `Toast/`, `ToastViewport/`.

## Auditoría (@reviewer)

Sistema auditado contra `rules.md`/`design.md`: sin fugas de memoria (timers con cleanup, cancel flags), sin ciclos de imports, i18n completa sin strings hardcodeados, tokens puros, IPC con forma correcta y JSDoc completo. Hallazgos resueltos: H1 (value del provider memoizado), H2 (close bespoke documentado), H3 (typedef `ToastVariant` centralizado, referenciado en los JSDoc de Toast/ToastViewport), H4 (timers de toasts descartados por el tope se limpian). `npm run lint` en verde y build del renderer OK.

## 5. Corrección del Motor de Lanzamiento (spawn único, post-cierre)

La sesión con `openBehavior: 'new-window'` abría **una ventana por pestaña** (cada spawn pasaba `[bandera, url]`). El launcher ahora hace **UN spawn con todas las URLs**:

- `openUrlInBrowser(url, browser, openBehavior)` → `openUrlsInBrowser(urls, browser, openBehavior)`: con `new-window` arma `[bandera, ...urls]` (el navegador abre el conjunto en una sola ventana, cada URL como pestaña) y con `active-tab` solo las URLs (pestañas en la ventana vigente). De paso elimina la race de spawns paralelos de `active-tab` cuando el navegador arranca en frío.
- **Semántica de error**: con un solo spawn el resultado es todo o nada. Un spawn que falla (ejecutable inexistente) ahora **lanza** → toast `launch.error` (antes el total fallido mostraba el warning `partialFailure`, engañoso porque nada se abrió). `failed > 0` (→ `launch.partialFailure`) solo puede darlo el fallback de sistema `shell.openExternal` (allSettled por URL), que no se puede batch-ar.
- **Guard defensivo**: sesión sin pestañas → `{ opened: 0, failed: 0 }` sin spawn (preserva el no-op previo).
- Sync obligatoria de `.doc/backend.md` (regla 6): descripción de `launcherService` y flujo del lanzamiento con la nueva semántica.

## 6. Política de toasts documentada (post-cierre)

Se formalizó la decisión de diseño de feedback para que no se inunden las vistas de toasts:

- `.doc/design.md` §3 (bullet Toast): bloque **"Política de uso — ¿cuándo se emite un toast?"** — principio rector *solo se tostea en cambios o resultados que el usuario no puede ver desde la vista actual*; éxito únicamente si el resultado no es visible (archivo a disco, catálogo reemplazado, limpieza sin cambio visual) o es bulk/cross-context; nunca éxito sobre cambios in-place (crear/editar/borrar, tema, idioma, navegador); error siempre (infrecuentes, explican el porqué); warning para parciales; alternativa inline para fallos contextuales (no duplicar toast + inline).
- `.doc/rules.md` **§10 "Feedback visual (toasts)"** (regla obligatoria): ancla el principio con cross-ref a `design.md` §3 y la exigencia de que los mensajes lleguen resueltos por `t()` (regla §9).

## Fuera de esta fase

- Responsive parcial y sidebar superpuesta en pantallas pequeñas (v0.4.5). El resto de v0.5.x (temas personalizados, duplicar sesión, historial de tabs) sigue pendiente.

## Estado

- Lo hecho: los 2 items v0.4.4 de `Plan/to_do.md` en `[x]` (control de errores en importación y sistema de toast), con la decisión de feedback confirmada: códigos de error por caso, toasts de éxito en las 4 acciones discretas (import/export/clear-cache/delete-all) y `primary` como color de confirmación (sin token nuevo).
- Lo hecho post-cierre: corrección del Motor de Lanzamiento (spawn único con todas las URLs; `new-window` abre el conjunto en una sola ventana y `active-tab` como pestañas en la ventana vigente; spawn fallido total → `launch.error`, parciales solo vía fallback `openExternal`) y política de toasts documentada (`.doc/design.md` §3 + nueva regla `.doc/rules.md` §10, principio "solo toast si el resultado no es visible en la vista actual"). Roadmap sin cambios (los 2 items de v0.4.4 ya estaban en `[x]`; el fix y la política no tienen items propios).
- Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*` (`.doc/architecture.md`, `.doc/backend.md`, `.doc/config_file.md` con su default), `AGENTS.md` (sección "Fase actual") actualizado, changelog completado y roadmap verificado. Re-cierre sin bump (la versión ya quedó en `0.4.4` tras el cierre original). Verificación de lint OK. No se publicó pre-release (app local de escritorio). No se hicieron commits (pendiente por decisión de sesión).