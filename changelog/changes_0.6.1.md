# Cambios 0.6.1

v0.6.1 — Quick wins del Hub (primera entrega de v0.6.0 "Organización del Hub"). Favoritos/pinned (las sesiones fijadas aparecen primero, con estrella en la card y en el Detalle), búsqueda de sesiones en el header del Hub (patrón de Configuración) y, como ampliación dentro de la misma versión, un widget de **menú de overflow** ("...") para las acciones secundarias del Detalle (Duplicar/Eliminar salen del header a un menú accesible por click).

## 1. Backend: campo `pinned`

- **`src/renderer/shared/types.js`**: `Workspace.pinned` (JSDoc) — `boolean?`, default `false`; no se copia al duplicar (el clon arranca desfijado).
- **`src/main/data/workspaceRepository.js`**: `normalizeWorkspace()` rellena `pinned: false` (migración de configs viejas, mismo patrón que `openBehavior`/`browser`).
- **`src/main/services/workspaceService.js`**: `createWorkspace()` arma `pinned: false`; `duplicateWorkspace()` clona con `pinned: false` — no hereda el fijado de la fuente.
- **Sin canal IPC nuevo**: el toggle de fijado pasa por el líder único de escritura del renderer (`mutateWorkspace` → `workspace:update`). Como el toggle no cambia las pestañas, el diff de historial de v0.5.4 no registra nada (documentado en `backend.md`/`config_file.md`).

## 2. Renderer: Hub — búsqueda y fijado

- **Búsqueda** (`useWorkspacesHub` + `WorkspacesHubView`): `searchQuery`/`setSearchQuery` + `TextInput type="search"` (icono, placeholder y `aria-label` por `t()`) en el header del Hub; filtra por nombre/descripción (case-insensitive) y muestra `hub.noResults` cuando la búsqueda no coincide (se reemplaza el grid por un mensaje).
- **Fijado** (`entities/workspace/hook/useToggleWorkspacePin.js`, nuevo): toggle de `pinned` con `mutateWorkspace` **inyectado por deps** (mismo precedente que `useTabModal` con `addTab`/`updateTab` — importar `useWorkspaces` desde entities crearía el ciclo `app → entities → app`). Error → `console.error` + toast localizado `hub.pinError` (regla 10); éxito sin toast (cambio in-place visible, regla 10). Lo consumen Hub y Detalle (precedente `useLaunchWorkspace`).
- **`entities/workspace/ui/PinButton.jsx`** (nuevo): estrella de fijado compartida card + Detalle. `aria-pressed` + `aria-label` estable (`hub.pinSession`) + `title` dinámico solo como tooltip; stopPropagation en pointerdown/click (la card es clickeable). Prop `appearOnHover` (default `false`): en la card `appearOnHover={!pinned}` — **fijada siempre visible** (el estado persistente se lee sin hover); **no fijada se revela en hover** (patrón del play del footer: `opacity-0` conserva el slot `w-8`, sin shift de layout) **y también con `focus-visible`**, así el teclado la alcanza igual. En el Detalle siempre visible en ambos estados.
- **Orden**: `visibleWorkspaces` (useMemo) filtra y luego ordena **fijadas primero** (`sort` estable sobre `Number(pinned)` — dentro de cada grupo se mantiene el orden de creación; el orden aplica también al buscar).

## 3. Renderer: menú de overflow del Detalle

- **`widgets/hooks/useMenu.js`** (nuevo): estado open/close del popover — se abre por click (no hover), cierra con click-fuera o `Esc` (que devuelve el foco al trigger), foco en el primer item **no deshabilitado** al abrir y roving focus con flechas que **salta items disabled** y solo aplica si el foco está dentro del menú. Listeners de documento con cleanup (regla 2.2).
- **`widgets/ui/Menu/Menu.jsx`** (nuevo): trigger `IconButton` ghost `more_vert` (`aria-haspopup="menu"`/`aria-expanded`) + popover `bg-surface border border-border rounded-xl shadow-xl p-1 z-[40]` (bajo modales `z-50` y toasts `z-[60]`) con `aria-label` (mismo texto del trigger). Items data-driven `{ key, label, icon?, variant?, disabled?, onClick }` con labels ya resueltos por `t()` (regla 9); variante `danger` (`text-error hover:bg-error/10`) para destructivas, que van al final del menú (patrón de seguridad). Activar un item devuelve el foco al trigger antes de ejecutar la acción.
- **Header del Detalle** (`WorkspaceDetailView`): pasa de 6 controles a `[Lanzar] [Editar] [PinButton] [...] | [Volver]` — **Duplicar** (`content_copy`) y **Eliminar** (`delete`, danger, al final) viven en el menú; Edit/Pin quedan visibles y Back separado por divisor.
- **Barrels actualizados**: `widgets/ui/index.js`, `widgets/index.js`, `widgets/hooks/index.js` (Menu + useMenu), `entities/workspace/hook/index.js`, `entities/workspace/ui/index.js`, `entities/workspace/index.js` (PinButton + useToggleWorkspacePin). `WorkspaceCard` usa `PinButton` (se eliminó el `IconButton` estrella inline).

## 4. i18n

6 claves nuevas con paridad es/en: `hub.searchPlaceholder` ("Buscar sesiones"/"Search sessions"), `hub.noResults` ("No hay sesiones que coincidan con tu búsqueda."/"No sessions match your search."), `hub.pinSession` ("Fijar sesión"/"Pin session"), `hub.unpinSession` ("Desfijar sesión"/"Unpin session"), `hub.pinError` ("No se pudo cambiar el estado fijado de la sesión."/"Couldn't update the session's pinned state.") y `menu.moreActions` ("Más acciones"/"More actions"). Sin strings visibles hardcodeados en JSX (regla 9).

## Auditoría (@reviewer)

Dos pasadas. **Primera (menú + refactor de fijado):** 0 hallazgos M. L aplicados: roving focus que salta items `disabled`, activar un item devuelve el foco al trigger, las flechas solo navegan si el foco está dentro del menú, `aria-label` del popover, y documentación (design.md §2 excepción de densidad 20px para la estrella `sm` y §3 focus ring propio del popover sobre `bg-surface`). **Segunda (ajuste estético de la estrella):** `PinButton` gana `appearOnHover` — la estrella no fijada de la card se revela en hover/foco de teclado; quedó documentado el trade-off a11y en design.md §4 (fijado siempre visible por ser estado persistente; no fijado se revela, sin perder alcance por teclado). `npm run lint` en verde.

## Docs

- `.doc/backend.md`: `pinned` en `createWorkspace`/`duplicateWorkspace`/`normalizeWorkspace` y la nota del toggle vía `workspace:update` (sin registro de historial); bump de header a v0.6.1.
- `.doc/config_file.md`: campo `pinned` en la tabla de `Workspace` (default `false`, no se copia al duplicar) y el toggle como mutación de `workspace:update`; bump de header a v0.6.1.
- `.doc/architecture.md`: `useMenu`/`Menu` (widgets) y `useToggleWorkspacePin`/`PinButton` (entities) en el árbol; bump de header a v0.6.1.
- `.doc/design.md`: §2 excepción de densidad 20px (estrella `sm` de la card), §3 bullet del widget `Menu` (comportamiento, tokens, a11y, variantes) y §4 trade-off del toggle de fijado + bullet del menú de overflow.

## Estado

- Lo hecho: items v0.6.1 de `Plan/to_do.md` en `[x]` (favoritos/pinned y búsqueda) + bullet nuevo del overflow del Detalle. Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*`, `AGENTS.md` (sección "Fase actual") actualizado, changelog completado y roadmap verificado. Lint en verde. No se publicó pre-release (app local de escritorio).
- Fuera de esta fase: v0.6.2 (última vez lanzada y orden de sesiones), v0.6.3 (carpetas y plantillas), v0.7.x (tabs avanzadas), personalización manual de colores.