# config.json — Estructura (v0.2.4)

El archivo de configuración vive en `app.getPath('userData')/config.json`. Lo administra `src/main/data/configStore.js` (acceso al archivo) y `src/main/data/workspaceRepository.js` (normalización y mutaciones de workspaces).

## Esquema raíz

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `version` | `string` | Versión del esquema de configuración. | `'0.2.4'` |
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
  "version": "0.2.4",
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

## Mutaciones (v0.2.1 · v0.2.2 · v0.2.4)

- **Crear sesión** (`workspace:create`): el id lo genera el proceso main (randomUUID), el `tabs` arranca `[]`, `openBehavior` arranca `'active-tab'` y `browser` arranca `null`.
- **Actualizar** (`workspace:update`): **update estricto (no upsert)** — si el `id` no existe en `workspaces`, lanza `Workspace no encontrado` (no inserta). Se reemplaza el workspace completo por su `id`.
- **Eliminar sesión** (`workspace:delete`): **baja estricta** — si el `id` no existe, lanza `Workspace no encontrado`; se elimina el elemento del array y se persiste.
- Toda mutación de pestañas o de configuración de sesión (openBehavior/browser) reescribe el **workspace completo**; el orden es siempre `create` → `update`.
- **Preferencias globales** (`config:updatePreferences`): **merge parcial** — las claves provistas se combinan sobre las existentes (p. ej. cambiar solo `defaultBrowser` deja intactas otras preferencias).
- **Metadatos web** (`page:metadata`): lectura sin persistencia; el `favicon` resultante se persiste en `Tab.favicon` (data URL) al guardar la pestaña.

## Tipos centralizados

La definición JSDoc de `Config`, `Workspace` y `Tab` vive en `src/renderer/shared/types.js`. No se redefinen por archivo.
