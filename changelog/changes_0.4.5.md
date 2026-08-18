# Cambios 0.4.5

v0.4.5 — Responsive. La app se adapta a anchos menores sin rediseño: el Hub muestra 3 columnas más temprano, el Detalle mantiene su grid (ya stackeaba bajo `lg`) y —lo central— la **sidebar en pantallas pequeñas queda siempre colapsada y fija**, expandiéndose **superpuesta al contenido por hover** sin quitarle espacio. Versión liviana (2 items de roadmap) sin cambios backend.

## 1. Sidebar superpuesta en pantallas pequeñas (< 1024px)

- **`shared/hook/useMediaQuery.js`** (nuevo): suscripción genérica a media queries CSS. Implementado con `useSyncExternalStore` + listener `change` de `matchMedia` con cleanup completo (regla 2.2) y safe-guard sin `matchMedia`. Exportado por `shared/index.js`.
- **`app/hook/useSidebar.js`**: consume `useMediaQuery('(max-width: 1023px)')` → devuelve `{ collapsed, toggle, isSmall }`. La preferencia persistida (`ui.sidebarCollapsed`) no se toca: en pantallas chicas se ignora (siempre colapsado) y se restaura al volver a ≥`lg`.
- **`widgets/layout/Sidebar/Sidebar.jsx`**: nueva prop `isSmall`. En modo overlay la sidebar queda `fixed inset-y-0 left-0 z-[40]` (debajo de modales `z-50` y toasts `z-[60]`), SIEMPRE colapsada (`w-16`) con el botón de colapsar oculto (no hay estado persistido que expandir); al hacer **hover se expande a `w-56` superpuesta** sobre el contenido (`shadow-xl`), y vuelve a colapsar al salir el puntero. Estado local `hovered` (hover trivial, excepción regla 1); los hijos usan `expanded = isSmall ? hovered : !collapsed`.
- **`widgets/layout/MainLayout/MainLayout.jsx`**: pasa `isSmall` a la sidebar y `main` reserva solo el rail colapsado con `pl-16` (el expandido no quita espacio, flota).
- **`app/App.jsx`**: propaga `isSmall` desde `useSidebar` hasta `MainLayout`.
- **`widgets/layout/Sidebar/SidebarItem.jsx`**: `aria-label` en estado colapsado (hallazgo M del @reviewer — design.md §4: iconos solos requieren nombre accesible; en overlay el estado colapsado es permanente).

## 2. Responsive parcial (mínimo viable)

- **Hub** (`WorkspaceGrid.jsx`): `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` → `... lg:grid-cols-3`: 3 columnas desde 1024px (más denso en el tamaño por defecto de la ventana).
- **Detalle**: sin cambios de código — el grid (`grid-cols-1 lg:grid-cols-[minmax(0,2fr)_32rem] xl:grid-cols-[minmax(0,1fr)_40rem]`) ya stackeaba en una columna bajo `lg`. Se **sincronizó `design.md`** al código real (la doc decía `1fr_24rem`, drift).
- **Configuración**: sin cambios — a ancho mínimo (800px) el header wrappea y las `OptionRow` entran.

## 3. Auditoría (@reviewer)

Hallazgos resueltos: **M** — `SidebarItem` sin nombre accesible cuando está colapsado (agravado por el overlay permanente) → `aria-label={label}` cuando `collapsed`. **L** — estado `hovered` stale al cruzar el breakpoint podía dejar la sidebar expandida sin hover → se quitaron los guards `isSmall &&` de los handlers de mouse (`hovered` es inerte en modo grande). **L** — `useMediaQuery` no re-sincronizaba el estado inicial si cambiaba la `query` → reescrito con `useSyncExternalStore` (lint-compliant, sin `setState` en efecto). Sin fugas (cleanup), barrels correctos (`shared/index.js`, consumo por barrel), tokens puros y z-stack documentado. `npm run lint` en verde y build del renderer OK.

## Docs

- `.doc/design.md` §3: grid del Detalle sincronizado al código real y nuevo bullet del widget `Sidebar` (modelo push ≥`lg` con persistencia en `ui.sidebarCollapsed`; overlay <`lg` siempre colapsado + hover superpuesto, `fixed` `z-[40]`, rail `pl-16` de MainLayout, toggle oculto, `shadow-xl` al expandir, transición `duration-base` sobre el ancho).
- `.doc/architecture.md`: `useMediaQuery.js` en el árbol de `shared/hook/`.
- Sin cambios backend/IPC → `backend.md`/`config_file.md` solo con bump de header/default.

## Estado

- Lo hecho: los 2 items v0.4.5 de `Plan/to_do.md` en `[x]` (responsive parcial en Hub/Detalle/Configuración y sidebar superpuesta por hover en pantallas pequeñas). Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*` (`.doc/architecture.md`, `.doc/backend.md`, `.doc/config_file.md` con su default), `AGENTS.md` (sección "Fase actual") actualizado, changelog completado y roadmap verificado. Verificación de lint OK. No se publicó pre-release (app local de escritorio). Commit del cierre realizado por decisión de sesión.