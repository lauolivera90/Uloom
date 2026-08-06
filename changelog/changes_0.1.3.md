# Cambios 0.1.3

## Navegación principal — Sidebar/Nav

- Nuevo widget `Sidebar` (+ `SidebarItem`) en `widgets/layout/`: navegación lateral con item activo por ruta. Sesiones queda activo en `/` y en `/workspaces/:id` (segundo nivel); Configuración solo en `/settings`.
- Nuevo widget `MainLayout` en `widgets/layout/`: shell push (`Sidebar` + zona de contenido vía `<Outlet/>`), consumido como layout route en `App.jsx`.
- Sidebar colapsable: expandido `w-56` con marca "Uloom" + botón colapsar; colapsado `w-16` a columna de iconos (solo botón re-expandir).
- Persistencia del estado colapsado en `localStorage` (hook `useSidebar`, lectura síncrona → sin flash de arranque). Diferido a `config.json` (cadena `config:set`) cuando el config tenga consumidor real fuera del mock.
- Se eliminaron los botones de "Configuración" redundantes de los headers de `WorkspacesHubView` y `WorkspaceDetailView` (el nav es ahora la única navegación).

## Librería de widgets

- `Icon`: nuevo tamaño `20` (densidad). Excepción documentada en `design.md`.
- `IconButton`: nuevo prop `size` (`md`/`sm`) y `noFocusRing` (el sidebar no usa ring por decisión de diseño).

## Hub de Sesiones

- Modal de creación: la descripción es opcional (placeholder "Descripción de la sesión"); se elimina el texto derivado "Sesión de {name}".
- `WorkspaceCard`: igual alto por fila — la card es `flex flex-col` y el body `flex-1`, de modo que el contenedor de la descripción crece al alto del hermano más alto y el footer se ancla abajo.

## Versiones y documentación

- Unificación de versión a `0.1.3`: `package.json`, `package-lock.json` (estaba en `1.0.0`), esquema `config.json` (`configRepository.js`), `backend.md`, `config_file.md`, `architecture.md` y `AGENTS.md`.
- Inicio del historial de versiones en `changelog/`.
