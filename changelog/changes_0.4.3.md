# Cambios 0.4.3

v0.4.3 — Pase de UI y estabilidad. El grid del Detalle deja de usar el ancho fijo de `40rem` que aplastaba la lista de tabs: pasa a 2 columnas desde `lg` con la derecha fija en `24rem` y apilado por debajo, con la regla de decisión de anchos documentada. Los headers de modal y confirm usan `accent` como los headers de card del Detalle (mismo tratamiento visual). La **auditoría general** recorrió renderer y main sin hallazgos: `npm run lint` en verde, sin errores de consola en los flujos normales (los `console.error` restantes son la convención de fallback, sin toasts — v0.4.4), sin unhandled rejections y con todos los efectos usando cancel flags/cleanup.

## 1. Grid del Detalle de Sesión

- **`features/WorkspaceDetail/ui/WorkspaceDetailView.jsx`**: el grid pasa de `grid-cols-[minmax(0,1fr)_40rem]` a **`grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_24rem] items-start gap-6`**. Con la columna derecha fija en `40rem` (640px) + `gap-6`, en la ventana default (1100 − sidebar − padding) la lista de tabs quedaba aplastada a ~164px y en el mínimo (800) casi nula; ahora la izquierda es absorbente (`minmax(0,1fr)`), la derecha fija en `24rem` y por debajo de `lg` todo apila en una columna (a 1100 se mantienen 2 columnas, a 800 se apila).
- **`.doc/design.md`**: la regla queda documentada — grid del Detalle con izquierda absorbente + derecha fija `24rem` (se decide por contenido: rows `OptionRow` con `Select`; si cambiara el contenido, se revisa este ancho, no se agrega otra columna ad-hoc).

## 2. Headers de modal y confirm (`text-accent`)

- **`widgets/ui/Modal/Modal.jsx`**: el título `h2` del header pasa de `text-text` a **`text-accent`**, el mismo tratamiento visual que los headers de card del Detalle (`ResourceCardHeader`). Como `ConfirmDialog` y los modales de form (`WorkspaceFormModal`, `TabFormModal`, `GlobalCreateWorkspace`) usan el `title` de `Modal`, un solo cambio cubre todos.
- **`.doc/design.md`** §3: el título del header de modal va en `accent`, sobre `bg-accent/10`; sin iconos líder en los headers de modal (solo el título).

## 3. Auditoría general (sin cambios de código)

Code review completo de renderer y main (hooks de estado/form/modal, widgets, entidades, features, IPC, services y repositories) más `npm run lint`:

- **Lint**: `npm run lint` pasa en verde sobre todo el repo.
- **Consolas**: sin `console.error`/warnings en los flujos normales; los `console.error` que quedan son la convención de fallback del proyecto (estado de error sin toasts — el feedback visual es v0.4.4).
- **Unhandled rejections**: todos los `.then` del líder de escritura (`useWorkspaceState.writeChainRef`) encadenan `.catch` (mutate/addTab/deleteTab/updateTab/deleteWorkspace/clearMetadataCache/clearAll/import); los submits de modales loguean una sola vez en la vista.
- **Efectos**: cancel flags y cleanup correctos en `useTabForm` (debounce 400ms + `clearTimeout`), `useCachedQuery`, `useScrollLock` (restaura `overflow`) y el load inicial de `useWorkspaceState`.
- **IPC rule 7**: todos los handlers responden `{ success, data, error }` con try/catch; la API del renderer convierte `{ success: false }` en throw.
- **Tokens/design**: sin hex hardcodeados ni colores de paleta en componentes; sin referencias al grid viejo.

## 4. Internacionalización es/en (adelanto del roadmap v0.5.1)

La app deja de ser monolingüe: los textos visibles pasan a claves en los diccionarios `shared/lib/i18n/es.js` y `en.js` (única fuente de verdad) y los componentes los resuelven con `useI18n()` → `t(clave, { params })`. El selector "Idioma" vive en Configuración → Preferencias, persiste en `localStorage['uloom-language']` (misma estrategia que `uloom-theme`) y el default lo resuelve `navigator.language`; `LanguageProvider` (app/) provee `{ language, t, setLanguage }` y sincroniza `document.documentElement.lang`. El contexto y `useI18n` viven en `shared/` para que los widgets lo consuman sin crear ciclos de capas (detalle en `rules.md §9`).

- **Infraestructura**: `shared/lib/i18n/` con `es.js`/`en.js` (diccionarios), `dictionaries.js` (`DEFAULT_LANGUAGE`, `SUPPORTED_LANGUAGES`, `DICTIONARIES`, `normalizeLanguage`), `translate.js` (`translateKey` + `createTranslator`; plurales `{ one, other }` por `count`, interpolación `{param}`, fallback a la clave) y barrel `index.js`. `shared/hook/useI18n.js` define `I18nContext` + `useI18n` (lanza si se usa fuera del provider). `app/LanguageProvider.jsx` memoiza `t` por idioma; `app/hook/useLanguage.js` sincroniza `lang` y persiste con try/catch no bloqueante (patrón `useTheme`). `index.html` pasa a `lang="es"`.
- **Sweep de strings**: widgets (`Modal`, `ModalFooter`, `IconPicker`, `IconPickerField`, `Sidebar`), entidades (`WorkspaceFormModal`, `TabFormModal`, `WorkspaceCard`, `GlobalCreateWorkspace`), features (Hub/Grid, Detalle, TabList, TabRow, Config, ExportCard, Settings). `useSettings` y `useSessionConfig` consumen `t` desde hooks; `buildOpenBehaviors(t)` convierte los modos de apertura en opciones de Select.
- **Labels → claves**: `workspaceLabels.js` y `workspaceLaunch.js` exportan CLAVES del diccionario (ej. `ADD_TAB_LABEL = 'labels.addTab'`, `LAUNCH_EMPTY_TABS_TITLE = 'launch.emptyTabsTitle'`); `OPEN_BEHAVIORS` pasó a `OPEN_BEHAVIOR_OPTIONS` con `labelKey`, y los consumidores resuelven el texto con `t(clave)`. Los `console.error` y mensajes de error internos del backend NO se traducen (convención dev-facing); el lindero usa claves localizadas (ej. `detail.saveError`).
- **Hallazgos de la auditoría resueltos**: placeholder de URL de `TabFormModal` → `tabForm.urlPlaceholder` (`https://ejemplo.com` / `https://example.com`) y error de sesión indefinida de `useLaunchWorkspace` → `launch.sessionUndefined`.

## Backend / API (resumen de exponibles de la versión)

Sin cambios en IPC/services/repositories/preload. Solo se bumpó el `APP_VERSION` del esquema de configuración (`src/main/data/configStore.js`) a `0.4.3` (default de archivos `config.json` nuevos). `SCHEMA_VERSION` del formato de exportación sigue en `'0.4.1'` porque el formato de datos no cambió. `.doc/backend.md`/`.doc/config_file.md` reflejan el bump de versión (header y default del esquema). En la Frontend API del renderer (`entities/workspace/api/`), `workspaceLabels.js`/`workspaceLaunch.js` pasaron a exportar claves i18n y el barrel expone `OPEN_BEHAVIOR_OPTIONS` + `buildOpenBehaviors` — sincronizado en `.doc/backend.md`.

## Fuera de esta fase

- Feedback visual/toasts y control de errores en importación (v0.4.4), responsive parcial (v0.4.5). El i18n (roadmap v0.5.1) se entregó como adelanto en esta versión y queda registrado como tal en `Plan/to_do.md`; el resto de v0.5.x (temas personalizados, duplicar sesión, historial de tabs) sigue pendiente.

## Estado

- Lo hecho: los 3 items v0.4.3 de `Plan/to_do.md` en `[x]` (grid del Detalle con regla de anchos, auditoría general, header de modal/confirm en accent), con la decisión de anchos (izquierda absorbente + derecha fija `24rem`, stack desde `lg`) confirmada durante el desarrollo; el i18n de v0.5.1 se sumó como adelanto (item en `[x]` en el roadmap con la nota de adelanto).
- Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*` (`.doc/architecture.md`, `.doc/backend.md`, `.doc/config_file.md` con su default), `AGENTS.md` (sección "Fase actual") actualizado con el idioma, `rules.md §9` reescrita para la regla de internacionalización y `.doc/backend.md` (Frontend API) sincronizado con las claves i18n. Verificación de lint OK. No se publicó pre-release (app local de escritorio).