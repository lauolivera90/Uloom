# Cambios 0.2.2

## Configuración de Navegador por Sesión (card Configuración del Detalle)

La card Configuración del Lienzo dejó de ser placeholder: ahora define cómo y en qué navegador se abren las pestañas de la sesión cuando se lance (el launch real es v0.3).

- **Comportamiento de apertura**: `openBehavior` con opciones "Ventana activa" (`active-tab`, default) y "Ventana nueva" (`new-window`).
- **Navegador de uso**: `browser` con un **override fijo por sesión**. `null` muestra "Predeterminado" (hereda la preferencia global); elegir un navegador pineado fuerza ese navegador para la sesión.
- **Regla dura**: solo se ofrecen navegadores **instalados** en el sistema; jamás se sugiere uno que no exista.

## Preferencias globales (Configuración → Preferencias)

- La fila "Navegador predeterminado" es **funcional** (dejó de ser maqueta): `preferences.defaultBrowser` con valores `'system'` (decide el SO, default) o un navegador pineado.
- La opción de Tema sigue siendo solo ilustrativa (portabilidad/temas reales son v0.4).

## Herencia y resolución

- Modelo de 3 niveles para el lanzamiento (v0.3): **sesión → global → sistema**. Resolución: `sesión.browser ?? (global !== 'system' ? global : null)`; `openBehavior` de sesión con default `active-tab`.

## Detección de navegadores instalados

- Canal nuevo `browser:list`: `browserService.getInstalledBrowsers()` hace **probe de rutas fijas** (`fs.existsSync` sobre `PROGRAMFILES`, `PROGRAMFILES(X86)` y `LOCALAPPDATA`) para Chrome, Edge, Firefox, Brave, Opera y Vivaldi. Solo `win32`; fuera de scope: catálogo de apps / escaneo de Start Menu (ver `architecture.md`).

## Backend y persistencia

- Canal nuevo `config:updatePreferences` con **merge parcial** de preferencias (cambiar una clave deja intactas las demás).
- Separación por dominio **nueva** (decisión deliberada): `browserService`, `preferencesRepository` y `preferencesService` + handlers `browser`/`preferences`. El refactor de los archivos monolíticos restantes (`configRepository`, `configService`, `ipc/index.js`) queda anotado para v0.2.3.
- Defaults en `createWorkspace` (`openBehavior: 'active-tab'`, `browser: null`) y normalización/migración en el repository al leer y escribir (`openBehavior`, `browser`, `preferences`).
- Persistencia pesimista inmediata: cada cambio en la card reescribe el workspace completo; cada cambio de preferencia reescribe las preferencias. Errores logueados con `console.error` (sistema de toast sigue pendiente al final del proyecto).

## Frontend

- `useSessionConfig` (estado `draft` con cambio de ítem y persistencia) y `useInstalledBrowsers` (hook **shared**, cachea el listado) para alimentar la card.
- `WorkspaceConfig` reescrito **dat-driven**: itera un array de ítems (`select` o `radio-group`) con `OptionRow`, eliminando la variante hardcodeada de opción en línea.
- **`OptionRow` extraído a widget** (`widgets/ui/OptionRow`) con soporte de descripción y `line-clamp-2`, consumido tanto por `WorkspaceConfig` como por `SettingsView` (elimina la duplicación de la fila de Preferencias).
- Layout del Detalle en grid `grid-cols-[minmax(0,1fr)_40rem]` (administrador flexible + configuración fija) y descripciones por propósito: "Define cómo se abren las pestañas al lanzar la sesión." / "Elige el navegador en el que se abren sus pestañas."

## Documentación

- `.doc/backend.md` (canales `browser:list` y `config:updatePreferences`, `browserService` por dominio, herencia) y `.doc/config_file.md` (estructura de `preferences`, normalización y mutaciones).

## Revisión del reviewer (aplicada)

- **Race en escrituras consecutivas**: `useSessionConfig` serializa las persistencias en una cola de promesas y construye cada escritura sobre el último workspace persistido (ref sincronizado por efecto), de modo que cambiar navegador y comportamiento seguido no pisa el cambio anterior.
- **Salidas muertas**: la card Configuración ahora consume `isSaving` (Selects `disabled` mientras guarda) y muestra `error` en `text-error` bajo las filas.
- **Cache real de navegadores**: `useInstalledBrowsers` cachea la promesa de `browser:list` a nivel de módulo (lista estática por sesión de app); se rearma el cache si el fetch falla.
- **Duplicación de mapeo**: helper único `buildBrowserOptions(browsers)` en `workspaceLaunch.js`, usado por el Detalle y por Configuración.
- **`useCallback` removido** de `useSessionConfig` (hijos sin `React.memo`); `resolvedBrowserLabel` muestra solo "Predeterminado" mientras cargan los navegadores (evita el id crudo).
- **try/catch del borrado** movido de `WorkspaceDetailView` a `useDeleteTab.confirmDelete` (la vista solo llama `confirmDelete()`).
- **`ResourceCardHeader` extraído a widget** (`widgets/ui/ResourceCardHeader`), consumido desde el barrel por las dos cards del Detalle.

## Versiones

- Unificación de versión a `0.2.2`: `package.json`, `package-lock.json`, `APP_VERSION` en `configRepository.js`, `backend.md`, `config_file.md` y `architecture.md`.
- `config.json` agrega el bloque `preferences` (bump del `version` del esquema; la lectura preserva la versión previa y normaliza los campos nuevos).
