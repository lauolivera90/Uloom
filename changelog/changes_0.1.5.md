# Cambios 0.1.5

## Sistema de tokens — Regla "fill vs foreground" + rol de `accent`

Refactor de diseño del sistema de color, guiado por una revisión externa. El objetivo era resolver la sensación de "usar demasiado `primary`" y la deuda de contraste AA anotada en la roadmap, sin tocar valores RGB.

- **Nueva regla corta:** *¿es fill o foreground?* Si es relleno de acción/selección → `bg-primary` (+ `on-primary` encima); si es texto, ícono, borde o anillo de foco → `primary-hover`. Resuelve el contraste AA en dark (antes `--primary` como texto dejaba ~3.1:1) sin modificar los números.
- **`primary` queda reservado a fills** (botón `primary`, ítem activo del sidebar, selección de `IconPicker`), con `primary-hover` como su hover de relleno (`hover:bg-primary-hover`). Todo foreground de primary pasó a `primary-hover`: texto/borde hover de `Button ghost` y `CreateTile`, `hover:border-primary-hover` de `WorkspaceCard`, y el focus ring global → `ring-primary-hover`.
- **`accent` toma rol de identidad no interactiva:** ícono de `WorkspaceCard`, ícono de `WorkspaceDetailView` y wordmark "Uloom" del sidebar ahora `text-accent`. Contrastes verificados AA (≈5.0:1 en ambos temas).
- **Se eliminó el token `secondary`** (estaba sin consumidores y colisionaba de nombre con un variant). El variant del Button se renombró de `secondary` a **`outline`** (usa `border-border` + `text-primary-hover`, nunca el token). Documentado en `design.md`.
- Aplica a `Button`, `IconButton`, `ConfirmDialog`, `CreateWorkspaceModal` y `SettingsView` (que consumían `variant="secondary"`).

## Documentación

- `.doc/design.md`: lista de tokens sin `secondary`, variantes → `outline`, y nuevo apartado "Cuándo usar cada token" con la regla fill/foreground y el rol de `accent`.
- `Plan/to_do.md`: item de deuda AA (v0.2.3) resuelto vía `primary-hover`.

## Versiones

- Unificación de versión a `0.1.5`: `package.json`, `package-lock.json`, `APP_VERSION` en `configRepository.js`, `backend.md`, `config_file.md` (header + defaults), `architecture.md` y `AGENTS.md`.
- Sin cambios de estructura en `config.json` (solo bump del `version` del esquema).