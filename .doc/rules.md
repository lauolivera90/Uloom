# Reglas de Desarrollo — Uloom

## 1. Toda la lógica en hooks, componentes solo presentan

Ninguna lógica de negocio, estado complejo, efectos secundarios o funciones auxiliares debe definirse dentro de un archivo `.jsx`. Los componentes deben limitarse a:

- Importar hooks (`use*`) que contengan la lógica.
- Llamar los hooks al inicio del componente.
- Usar los valores y funciones retornadas en el JSX.

**Excepción:** Lógica trivial de UI que no pueda externalizarse (ej. toggle local de un tooltip, manejo de hover). Si requiere un `useEffect`, `useCallback`, `useMemo` o más de 5 líneas → debe ir a un hook.

**Criterio del proyecto:** Uloom prioriza la pureza arquitectónica por sobre la velocidad de escritura. Es aceptable (y esperado) terminar con varios hooks pequeños de una sola responsabilidad en vez de lógica inline en el componente, incluso en el MVP.

**Regla de verificación:** Si algo falla, se revisa el hook, no el componente. Esto evita tener que recorrer cientos de líneas de JSX para encontrar un efecto o estado.

**Al refactorizar:** Cada cambio en un hook debe verificar que el componente siga importando y usando correctamente los valores retornados.

## 2. Evitar renderizados infinitos y fugas de memoria (memory leaks)

### 2.1 Dependencias de hooks
- Todo `useEffect`, `useCallback`, `useMemo` debe declarar explícitamente su array de dependencias.
- No omitir dependencias intencionalmente. Si una función o variable se usa dentro, debe estar en el array.
- Si una función se pasa como dependencia, debe estar envuelta en `useCallback` para mantener la referencia estable.

### 2.2 Cleanup de efectos
- Todo `useEffect` que suscriba, cree timers (`setTimeout`/`setInterval`), añada event listeners o cree recursos (blob URLs, observers) DEBE retornar una función de cleanup.
- El cleanup debe ejecutarse en:
  - `return () => { ... }` del `useEffect`
  - Al cerrar modales (`onHide`)
  - Al cambiar el recurso (ej. nueva imagen subida antes de crear el blob)
  - Al desmontar el componente

### 2.3 Async en efectos
- Las funciones async dentro de `useEffect` deben usar un flag de cancelación para evitar actualizar estado en componentes desmontados:
  ```js
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await fetchData();
      if (!cancelled) setState(data);
    }
    load();
    return () => { cancelled = true; };
  }, [deps]);
  ```

### 2.4 useCallback para funciones pasadas como props
- Toda función que se pase como prop a un componente hijo debe estar envuelta en `useCallback`.
- **`useCallback` solo evita re-renders si el componente hijo está memoizado con `React.memo`.** Si el hijo no está memoizado, la referencia estable de la función no tiene ningún efecto en performance — igual se re-renderiza.
- Regla práctica: si vas a envolver una función-prop en `useCallback` por rendimiento, memoizá también el componente hijo con `React.memo`. Si el hijo no está (ni va a estar) memoizado, `useCallback` en esa función es opcional y no aporta nada — usalo solo si además necesitás estabilidad de referencia por otra razón (ej. dependencia de otro hook).

### 2.5 useMemo para valores derivados costosos
- Arrays filtrados, objetos agrupados, sorted lists → usar `useMemo` con las dependencias adecuadas.

### 2.6 Event listeners globales
- `window.addEventListener`, `document.addEventListener`, `IntersectionObserver`, `ResizeObserver` → siempre limpiar con `removeEventListener`/`disconnect` en el cleanup del `useEffect`.

## 3. Estructura de hooks

Cada hook debe:
- Ser un archivo `.js` en la carpeta `hook/` correspondiente a su feature o en `shared/hook/`.
- Retornar un objeto con los valores y funciones que necesita el componente.
- No tener dependencias circulares entre hooks del mismo nivel.
- Prefijo `use` obligatorio (ej. `useBlobUrl`, `useAppCatalog`).

**Enforcement:** La regla de "no dependencias circulares" se valida con el plugin de ESLint `import/no-cycle` (configurado en `.eslintrc`). No depende únicamente de la revisión manual — si el linter no está configurado en el proyecto, es prioridad configurarlo antes de escalar la cantidad de hooks.

## 4. Shared vs Feature

Si un hook o componente va a ser usado desde múltiples features/páginas (ej. catálogo de apps usado en WorkspaceDetail y Settings), debe vivir en:
- `shared/hook/` si es solo lógica
- `features/[nombre]/` si incluye UI + lógica, donde `[nombre]` es el nombre de la funcionalidad transversal

No duplicar lógica entre features.

## 5. Barrel exports (`index.js`)

Toda carpeta que `architecture.md` exige como punto de exportación (`shared/`, `widgets/`, cada subcarpeta de `features/`, `entities/[nombre]/`) sigue esta convención:

- El `index.js` usa **exclusivamente exports nombrados** (`export { X } from './X'`), nunca `export default`, para que los imports sean explícitos y el autocompletado/refactor de IDEs funcione bien.
- El `index.js` no contiene lógica ni JSX propio, solo reexporta.
- Se reexporta únicamente lo que otras capas necesitan consumir desde afuera. Lo interno de la carpeta (helpers privados, subcomponentes de uso exclusivo interno) no se expone en el barrel.
- Los imports desde otras capas siempre entran por el barrel (`import { WorkspaceCard } from 'entities/workspace'`), nunca apuntando directo a un archivo interno (`entities/workspace/ui/WorkspaceCard.jsx`).

## 6. Documentación del backend

Todo cambio en cualquiera de estas capas del backend debe reflejarse en la documentación:

- `src/main/data/` → `doc/config-file.md` (estructura del JSON)
- `src/main/services/` → `doc/backend.md` (lógica de negocio)
- `src/main/ipc/` → `doc/backend.md` (canales IPC)
- `src/preload.js` → `doc/backend.md` (API expuesta)
- `src/renderer/entities/workspace/api/` (workspaceIpcApi + localWorkspaceApi + barrel) → `doc/backend.md` (Frontend API)
- Nuevos campos en `config.json` → `doc/config-file.md`

**Regla:** Si agregás, modificás o eliminás un handler IPC, un método del service/repository, un campo del JSON, o un método de la API frontend, actualizá los docs en el mismo PR/commit. No se mergea código sin docs actualizados.

## 7. Manejo de errores en IPC

Los errores se detienen en la capa que los genera y se transforman antes de cruzar cualquier frontera (repository → service, service → ipc). El frontend nunca recibe una excepción cruda de Node ni un stack trace.

- **`data/` (repository):** lanza errores (`throw new Error(...)`) con mensajes descriptivos. No atrapa errores propios salvo que necesite agregar contexto.
- **`services/`:** deja subir los errores del repository salvo que necesite lógica de fallback o recuperación (ej. crear `config.json` si no existe).
- **`ipc/` (handlers):** SIEMPRE envuelve en try/catch. Ningún handler de `ipcMain` puede dejar escapar una excepción sin capturar — puede tirar abajo el proceso main. Responde siempre con la forma:
  ```js
  { success: boolean, data?: any, error?: string }
  ```
- **`entities/[nombre]/api/[nombre]IpcApi.js`:** convierte `{ success: false, error }` en un `throw new Error(error)`, para que los hooks consuman la API con try/catch estándar de JS, sin lidiar con formas de respuesta custom.
- **Nunca** se propaga el objeto `Error` completo (con `stack`) al renderer — solo el `.message`.

## 8. Documentación de funciones con JSDoc

Toda función exportada en services, repository, handlers, API de renderer y hooks públicos debe tener JSDoc con `@param` y `@returns` indicando los tipos de datos.

**Tipos centralizados:** Los `@typedef` de entidades de negocio (`Workspace`, `Tab`, `App`, `CatalogApp`) NO se redefinen en cada archivo. Viven en un único archivo fuente, por ejemplo `src/renderer/shared/types.js` (frontend) y su equivalente en backend si aplica, y se importan donde se necesiten:

```js
/** @typedef {import('../../shared/types').Workspace} Workspace */

/**
 * @param {Workspace} workspace
 * @returns {Promise<void>}
 */
export async function launchWorkspace(workspace) { ... }
```

Esto evita que la misma definición de tipo quede duplicada en múltiples archivos y se desincronice cuando cambia un campo.

Los hooks internos (usados por un solo hook/componente) y componentes JSX quedan exentos de JSDoc.

**Regla:** Si creás o modificás una función exportada, actualizá su JSDoc en el mismo cambio. Si el cambio afecta un campo de `Workspace`, `Tab`, `App` o `CatalogApp`, se actualiza el `@typedef` centralizado, no una copia local.

9. Preparación liviana para i18n futuro (sin implementar i18n en el MVP)

El MVP no soporta múltiples idiomas (ver límites del proyecto) y no debe implementarse ninguna infraestructura de traducción ahora (nada de useTranslation, librerías i18n, ni wrappers que simulen traducción). Los textos van hardcodeados en español, directo en el JSX. Solo dos hábitos, sin costo extra hoy:

No concatenar fragmentos de texto con variables en medio. Usar un template literal con la oración completa: `{`Tenés ${tabs.length} pestañas en este workspace`}` en vez de mezclar <p>Tenés {tabs.length} pestañas</p>. Esto es solo para que el texto quede como una unidad completa, no fragmentado.
No duplicar el mismo label/string en múltiples archivos (ej. "Guardar", "Cancelar", "Eliminar"). Si se repite, centralizarlo en un componente de shared/ui/, igual que cualquier otro caso de duplicación (regla 4).

No crear ninguna otra estructura anticipando i18n. Cuando llegue el momento de agregar soporte multi-idioma, será un cambio mecánico y acotado a los archivos .jsx de UI, no a hooks ni al backend.
