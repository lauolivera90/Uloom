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

9. Internacionalización (español / inglés)

La app soporta dos idiomas (es/en) desde v0.4.3. Los textos visibles NO van hardcodeados en el JSX: viven como claves en los diccionarios `shared/lib/i18n/es.js` y `en.js` (única fuente de verdad), y los componentes los resuelven con `useI18n()` → `t(clave, { params })`. Reglas:

- Toda cadena visible de UI va con `t('dominio.clave')`; ningún string de usuario final queda literal en JSX.
- No concatenar fragmentos de texto con variables en medio: usar parámetros `t('detail.deleteTabConfirm', { name })` con placeholders `{name}` en el diccionario. La oración completa vive en el diccionario.
- Plurales: el valor del diccionario puede ser `{ one, other }`; `t()` elige `one` con `count === 1` y `other` con el resto.
- No duplicar el mismo label en múltiples archivos (ej. "Guardar", "Cancelar", "Eliminar"): usar una clave compartida del diccionario. Las constantes de labels de `entities/workspace` (`workspaceLabels.js`, `workspaceLaunch.js`) exportan CLAVES (ej. `DELETE_TAB_LABEL = 'labels.deleteTab'`); los consumidores llaman `t(DELETE_TAB_LABEL)`.
- Los strings de logs (`console.error`) y mensajes de error internos del backend NO se traducen (convención dev-facing; el renderer muestra errores localizados en el lindero, ej. `detail.saveError`).
- No se traduce: datos del usuario (nombres de sesiones/tabs), nombres de navegadores (vienen del SO) y la marca "Uloom".
- El idioma se persiste en `localStorage['uloom-language']` (misma estrategia que `uloom-theme`) y el default lo resuelve `navigator.language`. El `LanguageProvider` (app/) provee `{ language, t, setLanguage }`; el contexto y `useI18n` viven en `shared/` para que los widgets lo consuman sin crear ciclos de capas.

Contexto histórico: antes de v0.4.3 esta regla ordenaba NO implementar i18n y dejar los textos en español; la preparación (oraciones enteras en template literals, labels centralizados) dejó el barrido mecánico. Se reemplaza por esta regla.

## 10. Feedback visual (toasts)

Los toasts existen para feedback de acciones, pero no toda acción merece uno. La política completa (con los casos aplicados) vive en `.doc/design.md` §3 (bullet Toast); acá queda la regla anclada:

- **Principio:** se emite un toast solo en cambios o resultados que el usuario **no puede ver desde la vista actual**. Si la UI ya refleja el resultado (item que aparece/desaparece, modal que cierra, toggle/select que cambia), NO hay toast.
- **Éxito:** solo cuando el resultado no es visible en la vista o es una operación bulk/cross-context (import, exportAll, exportSession, clearCache, deleteAll, duplicate). El `create` global del Sidebar tostéa solo fuera del Hub (estando en el Hub la card es visible in-place). Nunca sobre cambios in-place (crear/editar/borrar sesiones y pestañas, tema, idioma, navegador predeterminado).
- **Error:** siempre se justifica (infrecuentes y explican el porqué); imprescindibles en acciones externas/asíncronas (launch, import).
- **Warning:** resultados parciales (ej. `launch.partialFailure`).
- **Feedback alternativo:** error inline para fallos contextuales (form); no duplicar toast + inline.
- Los mensajes del toast siempre llegan resueltos por `t()` (regla §9); los mensajes dev-facing del backend no se traducen.
