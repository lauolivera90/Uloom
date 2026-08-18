# Sistema de Diseño — Uloom

Doc vivo de reglas visuales y de componentes. Se actualiza a medida que crece el sistema. Complementa a `architecture.md` (estructura) y `rules.md` (reglas de código).

## 1. Fuente de verdad (tokens)

- **Tokens de color y duración:** `src/renderer/app/index.css` (variables CSS `--text`, `--background`, `--primary`, `--primary-hover`, `--accent`, `--on-primary`, `--surface`, `--error`, `--on-error`, `--tertiary`, `--on-tertiary`, `--border`, `--overlay`, `--duration-*`).
- **Mapeo a utilidades Tailwind:** `tailwind.config.js` (`theme.extend.colors` y `theme.extend.transitionDuration`).
- **Regla:** los componentes usan SOLO los tokens (`bg-background`, `text-text`, `bg-primary`, `text-on-primary`, `bg-surface`, `border-border`, `bg-error`, `text-tertiary`, `duration-fast`, etc.). Nunca hex hardcodeado ni colores de la paleta por defecto. Este doc no duplica valores — el CSS es la fuente.
- **Paletas de identidad (v0.5.2):** los tokens de identidad (`--primary`, `--primary-hover`, `--accent`, `--on-primary`) son *palette-scoped*: `index.css` define bloques `[data-palette='<id>']` (claro) y `.dark[data-palette='<id>']` (oscuro) que los redefinen por paleta predefinida (violeta, azul, esmeralda, ámbar, rosa). Los estructurales viven solo en `:root`/`.dark`. El atributo `data-palette` se aplica en el `<html>` (paleta activa) o en cualquier subárbol (preview en vivo de un swatch). Catálogo de ids + labels en `shared/lib/palettes.js` (sin colores — CSS es la fuente); el allowlist del anti-flash (`public/theme-init.js`) debe listar los mismos ids (regla de sincronización documentada). Persistencia en `localStorage['uloom-palette']` (default `violeta`, sin anti-flash propio de paleta más allá de setear el atributo antes del paint).

### Cuándo usar cada token

| Token | Cuándo usarlo | Regla de oro |
|---|---|---|
| `text` | Texto por defecto | Sin color de significado |
| `background` | Fondo de la página | Nunca en contenedores elevados |
| `surface` | Cards, Modal, Sidebar | Contenedores elevados |
| `border` | Contornos (`border-border`) y divisores internos (`/40`) | Estructura |
| `overlay` | Solo el fondo oscurecido del Modal | Nada más |
| `primary` | **Fill** de acciones/selección (`bg-primary`) | Nunca como `text-primary` suelto |
| `primary-hover` | Foreground de primary (texto, íconos, bordes, rings: `text-primary-hover`, `border-primary-hover`, `ring-primary-hover`) **y** hover/press del fill primario (`hover:bg-primary-hover`) | Como foreground, sin fill detrás; como fill, solo el hover del primario |
| `on-primary` | Texto/íconos sobre `bg-primary` | Siempre con fill detrás |
| `accent` | Identidad **no interactiva**: íconos de sesión, wordmark | Nunca en botones ni estados |
| `error` / `on-error` | Acciones destructivas + errores de validación | Exclusivo |
| `tertiary` / `on-tertiary` | Advertencias no destructivas (`warning`) | Exclusivo |

Los tokens de identidad (`primary`, `primary-hover`, `accent`, `on-primary`) son **palette-scoped** desde v0.5.2: se eligen con el selector de paletas y se aplican por `data-palette` (ver §1). Los estructurales (`text`, `background`, `surface`, `border`, `overlay`, `error`, `tertiary` y sus `on-*`) NO cambian con la paleta — solo con claro/oscuro.

**Regla corta — ¿es fill o foreground?** Si es relleno de acción/selección → `bg-primary` (+ `on-primary` encima), con `primary-hover` como hover del fill. Si es texto, ícono, borde o anillo de foco → `primary-hover`. `accent` solo para identidad; `error`/`tertiary` solo para su semántica; el resto es estructura.

## 2. Lenguaje visual

- **Shape lock:** botones → `rounded`; contenedores grandes (Card, Modal) → `rounded-xl`. No mezclar escalas de radio sin una regla documentada.
- **Bordes:** contornos → `border-border`; divisores internos → `border-border/40`.
- **Sombras:** elementos pequeños (Card) → `shadow-sm`; overlays (Modal) → `shadow-xl`.
- **Focus ring estándar:** `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover focus:ring-offset-background`.
- **Feedback táctil:** `active:scale-[0.98]` en controles.
- **Motion (escala semántica):** `duration-fast` 150ms para hovers/micro-interacciones; `duration-base` 200ms para transiciones estándar; `duration-slow` 300ms para overlays/movimientos grandes. Respetar `prefers-reduced-motion`.
- **Iconos:** Material Symbols (fuente `@material-symbols/font-400`), siempre 24px, con `aria-hidden` en iconos decorativos. **Excepciones de densidad:** `16` para metadata compacta (ej. `WorkspaceCard`) y `20` para el botón colapsar del sidebar (`Icon` size `16|20`, `IconButton` size `sm`). No introducir otros tamaños sin regla documentada.

## 3. Widgets

- **Consumir SIEMPRE desde el barrel** (`widgets`). Nunca re-inventar primitivas (Button, Card, Modal) ni duplicar estilos existentes.
- **Estructura:** cada widget en `ui/<Widget>/<Widget>.jsx` (o `layout/<Widget>/`); lógica con efectos → hooks en `widgets/hooks/` con JSDoc.
- **Componentes solo presentan:** sin estado ni efectos en `.jsx` (salvo lógica trivial de UI).
- **Padding base `p-5`** en contenedores, con override real por `className` (chequeo `/(^|\s)p-/`).
- **Páginas** → widget `Page` (`widgets/layout`, consumido desde el barrel): contenedor raíz estándar `flex flex-col gap-6 p-6`, con override real por `className` (chequeos `/(^|\s)p-/` y `/(^|\s)gap-/`, mismo patrón que `Card`). Toda vista de feature arranca con `<Page>…</Page>`; variantes de espaciado (ej. `gap-4`) se pasan por prop, no se re-declara el contenedor.
- **Header de página** → widget `PageHeader` (`widgets/layout`): título `h1` (`text-2xl`) con `description` e `icon` líder opcionales a la izquierda (`text-accent`) y bloque `actions` a la derecha (fila `flex items-center gap-2 flex-shrink-0`). Es el header estándar de las vistas; headers compactos fuera de este patrón (ej. estado not-found) quedan fuera de la convención.
- **Grid del Detalle de Sesión** → 2 columnas desde `lg`: `grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_32rem] xl:grid-cols-[minmax(0,1fr)_40rem] items-start gap-6`. La columna izquierda es absorbente (`minmax(0,1fr)`/`2fr`, lista de recursos) y la derecha es **fija** en `32rem` (desde `lg`) y `40rem` (desde `xl`, cards Configuración/Exportar). Por debajo de `lg` apila en una sola columna. El ancho de la columna derecha se decide por contenido (rows `OptionRow` con `Select`); si cambiara ese contenido, se revisa este ancho, no se agrega otra columna ad-hoc.
- **Sidebar** (`widgets/layout`, modelo push) → en pantallas grandes (≥`lg`, 1024px) es colapsable a columna de iconos (`w-16`) y expandido usa `w-56`; la preferencia vive en `localStorage` (`ui.sidebarCollapsed`) y la expone `useSidebar`. En pantallas pequeñas (`isSmall`, por debajo de `lg`; hook `useMediaQuery`) el sidebar queda SIEMPRE colapsado (la preferencia persistida se ignora), se posiciona `fixed inset-y-0 left-0 z-[40]` (debajo de modales `z-50` y toasts `z-[60]`) y al hacer **hover se expande SUPERPUESTO** sobre el contenido, sin quitarle espacio: `MainLayout` reserva solo el rail colapsado con `pl-16` en `main`. El botón de colapsar se oculta en modo overlay (no hay estado persistido que expandir); la expansión por hover es el mecanismo y vuelve a colapsar al salir el puntero. Transición `duration-base` sobre el ancho y `shadow-xl` al expandirse en overlay.
- **Variants:** mapas de clases por `variant` con default sensato (ver `Button`). Variantes del Button: `primary`, `outline`, `ghost`, `warning` (token `tertiary`), `danger` (token `error`). `ConfirmDialog` consume `Modal` (size `sm`) + `Button` desde el barrel.
- **PalettePicker** (`widgets/ui`, v0.5.2): selector de paleta de identidad — grilla `flex items-center gap-2` de botones circulares (`w-7 h-7`) con preview en vivo de primary + accent (círculo partido en dos mitades). Cada botón lleva `data-palette={id}`: el CSS `[data-palette=...]` resuelve los tokens dentro de su subárbol, así el preview usa SOLO tokens sin duplicar colores en JS. Seleccionado → `ring-2 ring-primary-hover ring-offset-2 ring-offset-background`; resto → `border-border hover:border-primary-hover`; `active:scale-[0.98]` + `focusRing` estándar. Selección única → semántica de radio group (`role="radiogroup"` con `aria-label` = label de la fila + `role="radio"`/`aria-checked` por swatch); los swatches solos requieren `aria-label` + `title` con el label (a11y, §4). Presentacional: recibe `label`, `palettes` (`[{id, label}]`), `value` y `onChange`; los labels los resuelve el consumidor con `t(palette.labelKey)` (catálogo `shared/lib/palettes.js`).
- **Toast / ToastViewport** (`widgets/ui`, v0.4.4): feedback visual de acciones y errores. El viewport es un contenedor fijo `bottom-6 right-6 z-[60]` (por encima de modales, `z-50`) que apila toasts en columna; cada toast es `flex items-center gap-3 rounded-lg shadow-xl` con `duration-slow animate-in fade-in slide-in-from-bottom-2`, ícono Material Symbols líder, mensaje `text-sm font-medium` y botón de cierre con `aria-label` (`toast.dismiss`). **Variantes (solo tokens):** `success` → fill `bg-primary` + `text-on-primary` (confirmación = acción), `error` → `bg-error` + `text-on-error`, `warning` → `bg-tertiary` + `text-on-tertiary`, `info` → `bg-surface` + `text-text` + `border-border`. Iconos: `check_circle` / `error` / `warning` / `info`. El auto-cierre (4s default, tope de 4 visibles) lo maneja el `ToastProvider` (app/); los mensajes siempre llegan ya resueltos por `t()`. **Política de uso — ¿cuándo se emite un toast?** Solo en cambios o resultados que el usuario **no puede ver desde la vista actual**; si la UI ya refleja el resultado (item que aparece/desaparece, modal que cierra, toggle/select que cambia), no hay toast. Éxito: únicamente cuando el resultado no es visible en la vista (archivo escrito a disco, catálogo reemplazado por un respaldo, limpieza sin cambio visual) o es una operación bulk/cross-context con consecuencia amplia (aplicados hoy: import, exportAll, exportSession, clearCache, deleteAll). Nunca éxito sobre cambios in-place (crear/editar/borrar sesiones y pestañas, tema, idioma, navegador predeterminado). Error: siempre se justifica (son infrecuentes y explican el *porqué* que la UI no aclara); imprescindibles en acciones externas/asíncronas (launch, import). Warning: resultados parciales (ej. `launch.partialFailure`). Alternativa al toast: feedback inline para fallos contextuales (errores de form); no duplicar toast + inline. **Excepción documentada del botón de cierre:** sobre un fill de color el close es un `<button>` bespoke (no `IconButton`) con `hover:bg-overlay/10`, `rounded-md` (shape lock del toast) y focus `ring-current` — el `focusRing` estándar (`ring-primary-hover`) y el hover de las variantes de `IconButton` no contrastan bien sobre fills saturados; es la única desviación del patrón de cierre de controles.

### Convención de modales

Todos los modales siguen el mismo layout base (derivado de `WorkspaceFormModal` y `ConfirmDialog`):

- **Formularios** → `Modal size="md"` con título en el header; contenido en `Form` (gap default `5`) con `FormField` (label `text-sm font-medium`, gap `2`) y `TextInput`.
- **Confirmaciones** → `Modal size="sm"` vía `ConfirmDialog`.
- **Header del modal** → el título del header va en `text-accent` (igual que los headers de card del Detalle, `ResourceCardHeader`), sobre el fondo `bg-accent/10`. No se usan iconos líder en los headers de modal: solo el título.
- **Footer** → widget `ModalFooter`: par de botones que reparten el ancho con `flex-1` (`Cancelar`, `variant="outline"`, ícono `arrow_back` + acción principal con `confirmVariant` según semántica, ícono de acción y spinner cuando `isLoading`). El confirmar va `disabled` si la validación del form no pasa (`confirmDisabled`).
- **Cierre** → el botón `×` del header cierra y cancela; la vista llama `reset()` del form al cancelar.

## 4. Accesibilidad

- Contraste WCAG AA en texto y controles; usar `--on-primary` para texto sobre `--primary`.
- Iconos solos (sin texto) requieren `aria-label`.
- No usar `#000000` ni `#ffffff` puros.
