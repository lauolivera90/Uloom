# Cambios 0.1.4

## Pantalla 3: Configuración (Settings)

- Nuevo feature `features/Settings/` reemplazando el stub de `pages/Settings.jsx`: hook `useSettings` (sección activa + tema día/noche), widget `OptionRow` (label + descripción a la izquierda, control a la derecha) y `SettingsView`.
- Maqueta estática sin funcionalidad real: la lógica de portabilidad (v0.4.x) y el runtime de temas (v0.4.2) quedan para fases futuras.
- Navegador de apartados con `Button` del barrel (activo `primary`, inactivos `ghost`) — no se creó un widget de tabs; se decide cuando haya un segundo consumidor.
- Sección **Preferencias**: opción *Tema* con toggle día/noche (solo ilustra el control; el estado vive en `useSettings`).
- Sección **Sesiones**: opciones *Exportar todo* e *Importar* como placeholders (botones `secondary` sin `onClick`, con `aria-label`).
- Layout de lista con separadores: contenedor `divide-y divide-border/40`, filas con `py-5` (10px entre opciones a través del separador) y `mt-5` entre las tabs y la primera opción.
- Descartado: defaults globales de comportamiento de apertura/navegador — van a la página de Detalle por sesión (v0.2.2), no a Settings.
- `@reviewer`: solo señaló la duplicación pre-existente del header de página (h1 + p) entre `SettingsView` y `WorkspacesHubView`; se deja pendiente para un refactor de widgets con segundo consumidor.

## Versiones y documentación

- Unificación de versión a `0.1.4`: `package.json`, `package-lock.json`, `APP_VERSION` en `configRepository.js`, `backend.md`, `config_file.md` (header + defaults), `architecture.md` y `AGENTS.md`.
- Sin cambios de estructura en `config.json` (solo bump del `version` del esquema).
