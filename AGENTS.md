# Uloom — Contexto para agentes de desarrollo

Aplicación de escritorio para Windows, Electron + Vite + React (JS puro, SIN TypeScript) + Tailwind CSS. Gestor/lanzador de Workspaces basado en Web Tabs.

## Antes de escribir código

Leé siempre, en este orden, antes de tocar cualquier archivo:

1. `.doc/architecture.md` — estructura de carpetas (FSD simplificado), capas del backend (ipc/services/data), convenciones de nomenclatura.
2. `.doc/rules.md` — reglas obligatorias: separación lógica/hooks, memory leaks, barrels, manejo de errores IPC, JSDoc.
3. `.doc/design.md` — sistema de diseño: fuente de verdad de tokens (`src/renderer/app/index.css` + mapeo en `tailwind.config.js`), lenguaje visual (shape, bordes, sombras, focus, motion, iconos) y convenciones de widgets. Regla actual: los componentes usan SOLO tokens (`bg-background`, `text-text`, `bg-primary`, `text-on-primary`, `bg-surface`, `border-border`, `duration-fast`, etc.) — nunca hex hardcodeados ni colores de la paleta por defecto. Seguí los patrones de los widgets existentes (ej. `Button` y sus `variants`) y consumí SIEMPRE desde el barrel de `widgets`.

**Regla general de scope:** implementá únicamente lo que está descrito en `.doc/architecture.md` y `.doc/rules.md` para la fase actual (ver abajo). Si te parece que hace falta algo que no está documentado ahí, preguntame antes de darlo por sentado — no asumas ni agregues funcionalidad no pedida, aunque te parezca una buena idea.

## Fase actual: v0.1.4

3 páginas: Hub de Sesiones, Detalle de Sesión, Configuración. Navegación principal con Sidebar colapsable (modelo push, persistencia en localStorage, item activo por ruta). La página de Configuración es una maqueta: tabs Preferencias/Sesiones, toggle de Tema ilustrativo y placeholders de export/import (la portabilidad real es v0.4.x). La hoja de ruta por versión vive en `Plan/to_do.md`.

Este proyecto está planeado para escalar en fases futuras. Esta sección se actualiza en cada fase nueva — no asumas que el scope de v0.1.4 es el scope final del proyecto, pero tampoco adelantes funcionalidad de fases futuras sin que se documente acá primero.

## Reglas no negociables (resumen — el detalle completo está en .doc/rules.md)

- Componentes `.jsx` solo presentan. Toda lógica, estado, efectos → hooks `.js` en `hook/`.
- Todo `useEffect` con timers/listeners/recursos necesita cleanup. Async en efectos necesita flag de cancelación.
- `useCallback` en props solo tiene sentido si el hijo está memoizado con `React.memo` — si no, es ruido.
- Barrels (`index.js`) con exports nombrados únicamente, sin lógica propia. Los imports entre capas siempre entran por el barrel, nunca apuntando directo a un archivo interno.
- Errores IPC: `data/` lanza, `services/` deja subir salvo fallback, `ipc/` SIEMPRE atrapa y responde `{ success, data, error }`, `[x]IpcApi.js` convierte `{success:false}` en `throw`.
- `@typedef` de entidades (`Workspace`, `Tab`) centralizados en un solo archivo, nunca redefinidos por archivo.
- Toda función exportada en services/repository/handlers/API de renderer necesita JSDoc con `@param`/`@returns`.

## Sincronización de documentación

Si tocás algo en `src/main/data/`, `src/main/services/`, `src/main/ipc/`, `src/preload.js`, o `entities/workspace/api/`, actualizá `.doc/backend.md` y/o `.doc/config_file.md` en el mismo cambio. No dejes código sin su doc correspondiente.

## Inicio / Desarrollo / Cierre de versión (checklist obligatorio)

**Al iniciar una versión nueva:**
1. Leer `changelog/changes_<versión-previa>.md` (o el de la versión en curso si quedó abierto) y `Plan/to_do.md`, para arrancar con el punto de partida real y no repetir trabajo ya hecho.

**Durante el desarrollo — solo a pedido del usuario:**
2. Cuando el usuario lo indique, crear/actualizar `changelog/changes_<version>.md` como memoria de sesión (lo hecho, lo pendiente, el estado actual) para que la próxima sesión retome donde se dejó. No se genera automáticamente: lo dispara el usuario.

**Al confirmar que una versión está terminada (lo indica el usuario), en el mismo cambio:**
3. Unificar la versión en `package.json`, `package-lock.json` (raíz), `src/main/data/configRepository.js` (`APP_VERSION`), `.doc/backend.md`, `.doc/config_file.md` (header + defaults), `.doc/architecture.md` (header).
4. Completar `changelog/changes_<version>.md` con lo realmente shippeado (no lo que "debería" estar).
5. Verificar `Plan/to_do.md` contra el código: destildar (`[ ]`) cualquier item sin implementación real — la roadmap no debe sobre-registrar.
6. Actualizar `AGENTS.md`: la sección "Fase actual" a la nueva versión con su scope real.
7. Actualizar `.doc/backend.md`/`.doc/config_file.md` si el cierre tocó IPC/services/repository (regla 6 de `rules.md`).

## Flujo de trabajo con agentes

- **Plan** (agente primario): usalo para decisiones de arquitectura o cuando quiera pensar en voz alta sin que se toque ningún archivo todavía.
- **Build** (este agente, primario): implementación real, una vez que la decisión ya está tomada.
- **@reviewer** (subagente, solo lectura): auditoría de componentes/hooks contra `rules.md` (separación lógica/UI, simplicidad de pages, duplicación). Invocalo después de crear o modificar un componente — no lo uses para escribir código, solo para señalar problemas.
- **@explore** (subagente, solo lectura): para entender partes del código antes de tocarlas, sin gastar contexto de la sesión principal.

## Convención de sesiones

Una sesión por unidad de trabajo (un feature, un bugfix, una revisión), no una sesión única para todo el proyecto. Este archivo se recarga solo al empezar cada sesión nueva — no hace falta que le vuelva a pegar `architecture.md` o `rules.md` a mano.