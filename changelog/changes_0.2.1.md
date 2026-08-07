# Cambios 0.2.1

## Persistencia real (pesimista) — adiós mocks

La app dejó de ser 100% mock en memoria y ahora lee y escribe `config.json`.

- **Camino de escritura IPC**: canales `workspace:create` y `workspace:update` (se conserva `config:get` para el boot). Cadena completa `workspaceIpcApi` → `preload` → `ipc` → `configService` → `configRepository`.
- **Update estricto (no upsert)**: `configRepository.updateWorkspace` reemplaza por `id` y **lanza** `Workspace no encontrado` si el id no existe; `services` deja subir; `ipc` responde `{ success, data, error }`; la API del renderer convierte `{success:false}` en throw.
- **Creación**: `configService.createWorkspace` genera el id con `crypto.randomUUID()` (no llega del cliente) y arma el workspace con `tabs: []`.
- **Guardar árbol completo + orden create→update**: no hay canal `addTab`/`removeTab` suelto; añadir/eliminar pestaña reconstruye el array `tabs` completo y reescribe el workspace entero.
- **Normalización**: `configRepository` garantiza `tabs` como array al leer (equivalente a `migrate()`) y al escribir.
- **Boot real**: `useWorkspaceState` arranca `[]` y en montaje lee `getConfig()` con flag de cancelación; se eliminó `mockWorkspaces` (archivo y exports del barrel).

## CRUD de pestañas (Detalle / Lienzo)

- **Alta**: modal `AddTabModal` (form URL/nombre/ícono con preview, "Subir icono o Elegir uno" + `IconPicker`) y hooks `useAddTab`/`useAddTabForm`. URL obligatoria, normalización con prefijo `https://`, nombre sugerido del hostname.
- **Baja**: fila `TabRow` con `onDelete` → `ConfirmDialog` (variante `danger`) + hook `useDeleteTab`. Persistencia pesimista.
- **Favicon**: `TabFavicon` (entity) prioriza icono explícito (data URL o Material Symbol), si no el favicon del sitio vía servicio de Google, y cae a mapamundi con `onError`.

## Diseño del Lienzo (Detalle de Sesión)

- Header con nombre/descripción + acciones (Launch deshabilitado para v0.3, editar/borrar sesión inertes) y estado "No encontrada".
- Dos cards en fila: **Administrador de recursos** (lista de pestañas) con acción **"Agregar"** en el header (`outline bg-surface`, anclada a la derecha) y **Configuración** (placeholder).
- `IconPicker` extraído de feature a widget de barrel (con `role=radiogroup`); `IconButton` gana la variante `danger`; `CreateTile` con prop `description`.
- Convención de modales documentada en `.doc/design.md`.

## Revisiones aplicadas (reviewer)

- **Pesimismo estricto**: el form de creación y el de pestaña solo resetean tras `await` exitoso; los modales cierran únicamente con confirmación de disco; errores propagados y logueados (común único de log). El sistema de toast/mensajes se difiere al final del proyecto.
- Ref espejo de `workspaces` con deps explícitas; `submit().catch` en footer y `Form` de ambos modales; JSDoc de `form` como shape inline en vez de nombre del hook.

## Documentación

- `.doc/backend.md` (canales `workspace:create`/`workspace:update`, update estricto, pesimista, id `randomUUID`, normalización `tabs`, flujos) y `.doc/config_file.md` (normalización y mutaciones). `.doc/design.md` (convención de modales).

## Versiones

- Unificación de versión a `0.2.1`: `package.json`, `package-lock.json`, `APP_VERSION` en `configRepository.js`, `backend.md`, `config_file.md` y `architecture.md`.
- Sin cambios de estructura en `config.json` (bump del `version` del esquema; la lectura preserva la versión previa de configs existentes y normaliza `tabs`).