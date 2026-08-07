# config.json — Estructura (v0.2.2)

El archivo de configuración vive en `app.getPath('userData')/config.json`. Lo administra exclusivamente `src/main/data/configRepository.js`.

## Esquema raíz

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `version` | `string` | Versión del esquema de configuración. | `'0.2.2'` |
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
| `icon` | `string?` | Icono/favicon de la pestaña. |

## Default (archivo creado al primer arranque)

```json
{
  "version": "0.2.2",
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

## Mutaciones (v0.2.1 · v0.2.2)

- **Crear sesión** (`workspace:create`): el id lo genera el proceso main (randomUUID), el `tabs` arranca `[]`, `openBehavior` arranca `'active-tab'` y `browser` arranca `null`.
- **Actualizar** (`workspace:update`): **update estricto (no upsert)** — si el `id` no existe en `workspaces`, lanza `Workspace no encontrado` (no inserta). Se reemplaza el workspace completo por su `id`.
- Toda mutación de pestañas o de configuración de sesión (openBehavior/browser) reescribe el **workspace completo**; el orden es siempre `create` → `update`.
- **Preferencias globales** (`config:updatePreferences`): **merge parcial** — las claves provistas se combinan sobre las existentes (p. ej. cambiar solo `defaultBrowser` deja intactas otras preferencias).

## Tipos centralizados

La definición JSDoc de `Config`, `Workspace` y `Tab` vive en `src/renderer/shared/types.js`. No se redefinen por archivo.
