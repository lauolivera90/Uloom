# config.json — Estructura (v0.6.1)

El archivo de configuración vive en `app.getPath('userData')/config.json`. Lo administra `src/main/data/configStore.js` (acceso al archivo), `src/main/data/workspaceRepository.js` (normalización y mutaciones de workspaces) y `src/main/data/tabHistoryRepository.js` (historial de pestañas usadas, v0.5.4).

## Esquema raíz

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `version` | `string` | Versión del esquema de configuración. | `'0.6.1'` |
| `preferences` | `Preferences` | Preferencias globales de la aplicación. | `{ defaultBrowser: 'system' }` |
| `workspaces` | `Workspace[]` | Lista de sesiones de trabajo. | `[]` |
| `tabHistory` | `TabHistoryEntry[]` | Historial de pestañas usadas (reuso en el modal de agregar pestaña). No se exporta/importa. | `[]` |

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
| `pinned` | `boolean?` | Sesión fijada (favorito): aparece primero en el Hub (v0.6.1). Default `false`. No se copia al duplicar una sesión (el clon arranca desfijado). |

## `Tab`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único. |
| `url` | `string` | URL del sitio web. |
| `name` | `string` | Nombre visible de la pestaña. |
| `icon` | `string?` | Icono de la pestaña: símbolo del catálogo Material Symbols o **data URL** (favicon aplicado explícitamente por el usuario). |
| `favicon` | `string?` | Favicon del sitio como **data URL**, cacheado por el fetch de metadatos (`page:metadata`). Solo se actualiza al ejecutar un fetch nuevo; una elección manual de `icon` no lo pisa, y `icon` y `favicon` no se duplican (ver `pageService` en `backend.md`). |

## `TabHistoryEntry` (v0.5.4)

| Campo | Tipo | Descripción |
|---|---|---|
| `url` | `string` | URL normalizada de la pestaña. Clave de unicidad del upsert. |
| `name` | `string` | Nombre visible guardado al registrar la pestaña. |
| `icon` | `string?` | Icono manual de la pestaña al registrarla (símbolo del catálogo o data URL). |
| `favicon` | `string?` | Favicon cacheado como data URL si estaba disponible al registrar. |
| `count` | `number` | Veces que se usó (agregada o lanzada). |
| `lastUsedAt` | `string` | Última vez que se usó, en ISO 8601. |

## Default (archivo creado al primer arranque)

```json
{
  "version": "0.6.1",
  "preferences": {
    "defaultBrowser": "system"
  },
  "workspaces": [],
  "tabHistory": []
}
```

## Reglas de persistencia

- Si `config.json` no existe → se crea con el default.
- Si el JSON es inválido o `workspaces` no es un array → se restaura el default (sobrescribe el archivo corrupto).
- Al **leer**, cada workspace se normaliza: `tabs` siempre queda como array; `openBehavior` rellena `'active-tab'`, `browser` rellena `null` y `pinned` rellena `false` si vienen ausentes (migración ante edición manual del JSON o configs viejas).
- Al **leer**, `preferences` se normaliza: `defaultBrowser` rellena `'system'` si falta.
- Al **leer**, el historial (`tabHistory`) se normaliza: si no es un array queda `[]`; cada entrada sin `url` válida se descarta y las válidas rellenan `name`/`count`/`lastUsedAt` ante configs viejas. El orden de lectura es `count` desc → `lastUsedAt` desc (más usadas primero).
- Al **escribir**, tanto la creación como la actualización de un workspace normalizan `tabs`, `openBehavior`, `browser` y `pinned`; las escrituras del historial normalizan, ordenan y capan `tabHistory` (máx. 20 entradas, evicción de las menos usadas).
- La escritura usa pretty-print (indentación de 2 espacios).

## Mutaciones (v0.2.1 · v0.2.2 · v0.2.4 · v0.4.1 · v0.5.3 · v0.5.4 · v0.6.1)

- **Crear sesión** (`workspace:create`): el id lo genera el proceso main (randomUUID), el `tabs` arranca `[]`, `openBehavior` arranca `'active-tab'`, `browser` arranca `null` y `pinned` arranca `false`.
- **Duplicar sesión** (`workspace:duplicate`, v0.5.3): clona una sesión existente en un workspace nuevo — `id` nuevo (randomUUID), `name`/`description`/`icon` provistos por el usuario (editables en el modal antes de confirmar), `tabs` clonadas con **ids nuevos** (los favicons cacheados se copian tal cual) y `openBehavior`/`browser` copiados de la fuente. El clon **no hereda el `pinned`** de la fuente (arranca desfijado, v0.6.1). La sesión original nunca se modifica.
- **Actualizar** (`workspace:update`): **update estricto (no upsert)** — si el `id` no existe en `workspaces`, lanza `Workspace no encontrado` (no inserta). Se reemplaza el workspace completo por su `id`. El **fijar/desfijar una sesión** (v0.6.1) también pasa por acá: el Hub lo dispara con `mutateWorkspace` (toggle `pinned`) y reescribe la sesión completa — como no cambian las pestañas, el diff del historial no registra nada.
- **Eliminar sesión** (`workspace:delete`): **baja estricta** — si el `id` no existe, lanza `Workspace no encontrado`; se elimina el elemento del array y se persiste.
- **Eliminar todas las sesiones** (`workspace:clearAll`, v0.4.1): vacía `workspaces` **preservando `preferences`** (el navegador predeterminado global queda intacto). No es estricta: no lanza si la lista ya está vacía.
- **Limpiar caché de metadatos** (`workspace:clearMetadataCache`, v0.4.1): recorre todas las pestañas y remueve `Tab.favicon` (data URL cacheadas del fetch de `page:metadata`). Devuelve la cantidad de favicons removidos; los favicons se vuelven a obtener al editar la pestaña.
- **Historial de pestañas** (`tabHistory`, v0.5.4): registro de uso separado de las sesiones. Se alimenta desde el backend: al **agregar** pestañas (`workspace:update` detecta las URLs nuevas por diff del `tabs` previo — tanto el alta individual `addTab` como el lote `addTabs` de la selección múltiple) y al **lanzar** una sesión (`workspace:launch` registra las URLs abiertas). Upsert por `url` (`count+1`, `lastUsedAt`, refresco de `name`/`icon`/`favicon`), orden `count` desc → `lastUsedAt` desc y cap de 20 entradas. **No participa** del export/import de portabilidad (es caché local de uso).
- **Borrar historial de pestañas** (`tabHistory:clear`, v0.5.4): vacía `tabHistory` y devuelve la cantidad de entradas removidas. No es estricta: no lanza si ya está vacío.
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
- El respaldo **no incluye `preferences`** ni el **historial de pestañas** (`tabHistory`): solo sesiones. El campo `pinned` de cada sesión **sí viaja** (es parte de la entidad) y se preserva al importar.

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
