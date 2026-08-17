# config.json — Estructura (v0.4.4)

El archivo de configuración vive en `app.getPath('userData')/config.json`. Lo administra `src/main/data/configStore.js` (acceso al archivo) y `src/main/data/workspaceRepository.js` (normalización y mutaciones de workspaces).

## Esquema raíz

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `version` | `string` | Versión del esquema de configuración. | `'0.4.4'` |
| `preferences` | `Preferences` | Preferencias globales de la aplicación. | `{ defaultBrowser: 'system' }` |
| `workspaces` | `Workspace[]` | Lista de sesiones de trabajo. | `[]` |

## `Preferences`

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `defaultBrowser` | `string` | Navegador predeterminado global. `'system'` = decide el SO; cualquier otro valor es el id de un navegador instalado (p. ej. `'chrome'`). Lo controla Configuración → Preferencias. | `'system'` |

## `Workspace`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único. |
| `name` | `string` | Nombre de la sesión. |
| `description` | `string?` | Descripción opcional. |
| `icon` | `string?` | Icono de la sesión. |
| `tabs` | `Tab[]` | Pestañas web de la sesión. |
| `openBehavior` | `string` | Modo de apertura al lanzar la sesión: `'active-tab'` (ventana activa) o `'new-window'` (ventana nueva). Default `'active-tab'`. |
| `browser` | `string?` | Navegador de uso de la sesión. `null`/ausente = **heredar el predeterminado global** (Preferencias); un id = override fijo que no cambia ante cambios del global. |

## `Tab`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único. |
| `url` | `string` | URL del sitio web. |
| `name` | `string` | Nombre visible de la pestaña. |
| `icon` | `string?` | Icono de la pestaña: símbolo del catálogo Material Symbols o **data URL** (favicon aplicado explícitamente por el usuario). |
| `favicon` | `string?` | Favicon del sitio como **data URL**, cacheado por el fetch de metadatos (`page:metadata`). Solo se actualiza al ejecutar un fetch nuevo; una elección manual de `icon` no lo pisa, y `icon` y `favicon` no se duplican (ver `pageService` en `backend.md`). |

## Default (archivo creado al primer arranque)

```json
{
  "version": "0.4.4",
  "preferences": {
    "defaultBrowser": "system"
  },
  "workspaces": []
}
```

## Reglas de persistencia

- Si `config.json` no existe → se crea con el default.
- Si el JSON es inválido o `workspaces` no es un array → se restaura el default (sobrescribe el archivo corrupto).
- Al **leer**, cada workspace se normaliza: `tabs` siempre queda como array; `openBehavior` rellena `'active-tab'` y `browser` rellena `null` si vienen ausentes (migración ante edición manual del JSON o configs viejas).
- Al **leer**, `preferences` se normaliza: `defaultBrowser` rellena `'system'` si falta.
- Al **escribir**, tanto la creación como la actualización de un workspace normalizan `tabs`, `openBehavior` y `browser`.
- La escritura usa pretty-print (indentación de 2 espacios).

## Mutaciones (v0.2.1 · v0.2.2 · v0.2.4 · v0.4.1)

- **Crear sesión** (`workspace:create`): el id lo genera el proceso main (randomUUID), el `tabs` arranca `[]`, `openBehavior` arranca `'active-tab'` y `browser` arranca `null`.
- **Actualizar** (`workspace:update`): **update estricto (no upsert)** — si el `id` no existe en `workspaces`, lanza `Workspace no encontrado` (no inserta). Se reemplaza el workspace completo por su `id`.
- **Eliminar sesión** (`workspace:delete`): **baja estricta** — si el `id` no existe, lanza `Workspace no encontrado`; se elimina el elemento del array y se persiste.
- **Eliminar todas las sesiones** (`workspace:clearAll`, v0.4.1): vacía `workspaces` **preservando `preferences`** (el navegador predeterminado global queda intacto). No es estricta: no lanza si la lista ya está vacía.
- **Limpiar caché de metadatos** (`workspace:clearMetadataCache`, v0.4.1): recorre todas las pestañas y remueve `Tab.favicon` (data URL cacheadas del fetch de `page:metadata`). Devuelve la cantidad de favicons removidos; los favicons se vuelven a obtener al editar la pestaña.
- Toda mutación de pestañas o de configuración de sesión (openBehavior/browser) reescribe el **workspace completo**; el orden es siempre `create` → `update`.
- **Preferencias globales** (`config:updatePreferences`): **merge parcial** — las claves provistas se combinan sobre las existentes (p. ej. cambiar solo `defaultBrowser` deja intactas otras preferencias).
- **Metadatos web** (`page:metadata`): lectura sin persistencia; el `favicon` resultante se persiste en `Tab.favicon` (data URL) al guardar la pestaña.

## Formato de exportación (.json, v0.4.1)

Los archivos exportados (sesión individual o respaldo completo) son **un artefacto distinto de `config.json`** — se escriben en la ruta que elige el usuario en el diálogo nativo de guardado, con pretty-print de 2 espacios. Usan un wrapper con metadatos para que la importación (v0.4.2) pueda identificar y validar el archivo:

| Campo | Tipo | Descripción |
|---|---|---|
| `app` | `string` | Identificador de la aplicación emisora (`'uloom'`). |
| `kind` | `'workspace' \| 'backup'` | Sesión individual o respaldo completo de todas las sesiones. |
| `schemaVersion` | `string` | Versión del formato de exportación (`'0.4.1'`). |
| `exportedAt` | `string` | Fecha/hora de exportación en ISO 8601. |
| `data` | `Workspace[]` | Sesiones exportadas. Individual = `[workspace]`; backup = todas. |

```json
{
  "app": "uloom",
  "kind": "workspace",
  "schemaVersion": "0.4.1",
  "exportedAt": "2026-08-09T18:00:00.000Z",
  "data": [
    {
      "id": "…",
      "name": "…",
      "tabs": [],
      "openBehavior": "active-tab",
      "browser": null
    }
  ]
}
```

- Nombres sugeridos: sesión individual → `<slug-del-nombre>.json`; respaldo completo → `uloom-backup-YYYY-MM-DD.json`.
- El respaldo **no incluye `preferences`**: solo sesiones.

## Importación de sesiones (.json, v0.4.2)

El flujo inverso (`portability:import`) abre el diálogo nativo de apertura, valida el wrapper exportado y reconstruye el catálogo local. Reglas:

- **Validación del archivo:** debe tener `app: 'uloom'`, `kind` en `workspace | backup`, `schemaVersion` como string y `data` como array de workspaces con `name` string. Cualquier otro archivo se rechaza con `{ success: false }` y no toca el `config.json`.
- **Semántica por `kind`:**
  - `workspace` (sesión individual) → **agrega** la sesión al catálogo actual sin modificar lo existente. Si el id importado colisiona con una sesión local, el importado recibe un `id` nuevo (randomUUID) — nunca pisa una sesión del usuario.
  - `backup` (respaldo completo) → **reemplaza** el catálogo completo por las sesiones importadas, preservando `preferences` (el navegador predeterminado global queda intacto).
- Los workspaces importados se **normalizan** al persistir (tabs array, `openBehavior` y `browser` con defaults) igual que cualquier lectura.
- Cancelar el diálogo de apertura no es un error: devuelve `{ canceled: true }` y no toca el `config.json`.

## Tipos centralizados

La definición JSDoc de `Config`, `Workspace` y `Tab` vive en `src/renderer/shared/types.js`. No se redefinen por archivo.
