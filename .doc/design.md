# Sistema de Diseño — Uloom

Doc vivo de reglas visuales y de componentes. Se actualiza a medida que crece el sistema. Complementa a `architecture.md` (estructura) y `rules.md` (reglas de código).

## 1. Fuente de verdad (tokens)

- **Tokens de color y duración:** `src/renderer/app/index.css` (variables CSS `--text`, `--background`, `--primary`, `--primary-hover`, `--accent`, `--on-primary`, `--surface`, `--error`, `--on-error`, `--tertiary`, `--on-tertiary`, `--border`, `--overlay`, `--duration-*`).
- **Mapeo a utilidades Tailwind:** `tailwind.config.js` (`theme.extend.colors` y `theme.extend.transitionDuration`).
- **Regla:** los componentes usan SOLO los tokens (`bg-background`, `text-text`, `bg-primary`, `text-on-primary`, `bg-surface`, `border-border`, `bg-error`, `text-tertiary`, `duration-fast`, etc.). Nunca hex hardcodeado ni colores de la paleta por defecto. Este doc no duplica valores — el CSS es la fuente.

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
- **Padding base `p-5`** en contenedores, con override real por `className` (chequeo `includes('p-')`).
- **Variants:** mapas de clases por `variant` con default sensato (ver `Button`). Variantes del Button: `primary`, `outline`, `ghost`, `warning` (token `tertiary`), `danger` (token `error`). `ConfirmDialog` consume `Modal` (size `sm`) + `Button` desde el barrel.

### Convención de modales

Todos los modales siguen el mismo layout base (derivado de `CreateWorkspaceModal` y `ConfirmDialog`):

- **Formularios** → `Modal size="md"` con título en el header; contenido en `Form` (gap default `5`) con `FormField` (label `text-sm font-medium`, gap `2`) y `TextInput`.
- **Confirmaciones** → `Modal size="sm"` vía `ConfirmDialog`.
- **Footer** → widget `ModalFooter`: par de botones que reparten el ancho con `flex-1` (`Cancelar`, `variant="outline"`, ícono `arrow_back` + acción principal con `confirmVariant` según semántica, ícono de acción y spinner cuando `isLoading`). El confirmar va `disabled` si la validación del form no pasa (`confirmDisabled`).
- **Cierre** → el botón `×` del header cierra y cancela; la vista llama `reset()` del form al cancelar.

## 4. Accesibilidad

- Contraste WCAG AA en texto y controles; usar `--on-primary` para texto sobre `--primary`.
- Iconos solos (sin texto) requieren `aria-label`.
- No usar `#000000` ni `#ffffff` puros.
