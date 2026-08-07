# config.json — Estructura (v0.2.1)

El archivo de configuración vive en `app.getPath('userData')/config.json`. Lo administra exclusivamente `src/main/data/configRepository.js`.

## Esquema raíz

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `version` | `string` | Versión del esquema de configuración. | `'0.2.1'` |
| `workspaces` | `Workspace[]` | Lista de sesiones de trabajo. | `[]` |

## `Workspace`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único. |
| `name` | `string` | Nombre de la sesión. |
| `description` | `string?` | Descripción opcional. |
| `icon` | `string?` | Icono de la sesión. |
| `tabs` | `Tab[]` | Pestañas web de la sesión. |

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
  "version": "0.2.1",
  "workspaces": []
}
```

## Reglas de persistencia

- Si `config.json` no existe → se crea con el default.
- Si el JSON es inválido o `workspaces` no es un array → se restaura el default (sobrescribe el archivo corrupto).
- Al **leer**, cada workspace se normaliza: `tabs` siempre queda como array (equivalente a un `migrate()` ante edición manual del JSON).
- Al **escribir**, tanto la creación como la actualización de un workspace normalizan `tabs` como array.
- La escritura usa pretty-print (indentación de 2 espacios).

## Mutaciones (v0.2.1)

- **Crear sesión** (`workspace:create`): el id lo genera el proceso main (randomUUID) y el `tabs` arranca `[]`.
- **Actualizar** (`workspace:update`): **update estricto (no upsert)** — si el `id` no existe en `workspaces`, lanza `Workspace no encontrado` (no inserta). Se reemplaza el workspace completo por su `id`.
- Toda mutación de pestañas reescribe el **workspace completo** (no hay canal `addTab`/`removeTab` suelto); el orden es siempre `create` → `update`.

## Tipos centralizados

La definición JSDoc de `Config`, `Workspace` y `Tab` vive en `src/renderer/shared/types.js`. No se redefinen por archivo.
