# Sistema de Diseño — Uloom

Doc vivo de reglas visuales y de componentes. Se actualiza a medida que crece el sistema. Complementa a `architecture.md` (estructura) y `rules.md` (reglas de código).

## 1. Fuente de verdad (tokens)

- **Tokens de color y duración:** `src/renderer/app/index.css` (variables CSS `--text`, `--background`, `--primary`, `--secondary`, `--accent`, `--on-primary`, `--surface`, `--error`, `--on-error`, `--tertiary`, `--on-tertiary`, `--border`, `--duration-*`).
- **Mapeo a utilidades Tailwind:** `tailwind.config.js` (`theme.extend.colors` y `theme.extend.transitionDuration`).
- **Regla:** los componentes usan SOLO los tokens (`bg-background`, `text-text`, `bg-primary`, `text-on-primary`, `bg-surface`, `border-border`, `bg-error`, `text-tertiary`, `duration-fast`, etc.). Nunca hex hardcodeado ni colores de la paleta por defecto. Este doc no duplica valores — el CSS es la fuente.

## 2. Lenguaje visual

- **Shape lock:** botones → `rounded`; contenedores grandes (Card, Modal) → `rounded-xl`. No mezclar escalas de radio sin una regla documentada.
- **Bordes:** contornos → `border-border`; divisores internos → `border-border/40`.
- **Sombras:** elementos pequeños (Card) → `shadow-sm`; overlays (Modal) → `shadow-xl`.
- **Focus ring estándar:** `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background`.
- **Feedback táctil:** `active:scale-[0.98]` en controles.
- **Motion (escala semántica):** `duration-fast` 150ms para hovers/micro-interacciones; `duration-base` 200ms para transiciones estándar; `duration-slow` 300ms para overlays/movimientos grandes. Respetar `prefers-reduced-motion`.
- **Iconos:** Material Symbols (fuente `@material-symbols/font-400`), siempre 24px, con `aria-hidden` en iconos decorativos. **Excepciones de densidad:** `16` para metadata compacta (ej. `WorkspaceCard`) y `20` para el botón colapsar del sidebar (`Icon` size `16|20`, `IconButton` size `sm`). No introducir otros tamaños sin regla documentada.

## 3. Widgets

- **Consumir SIEMPRE desde el barrel** (`widgets`). Nunca re-inventar primitivas (Button, Card, Modal) ni duplicar estilos existentes.
- **Estructura:** cada widget en `ui/<Widget>/<Widget>.jsx` (o `layout/<Widget>/`); lógica con efectos → hooks en `widgets/hooks/` con JSDoc.
- **Componentes solo presentan:** sin estado ni efectos en `.jsx` (salvo lógica trivial de UI).
- **Padding base `p-5`** en contenedores, con override real por `className` (chequeo `includes('p-')`).
- **Variants:** mapas de clases por `variant` con default sensato (ver `Button`). Variantes del Button: `primary`, `secondary`, `ghost`, `warning` (token `tertiary`), `danger` (token `error`). `ConfirmDialog` consume `Modal` (size `sm`) + `Button` desde el barrel.

## 4. Accesibilidad

- Contraste WCAG AA en texto y controles; usar `--on-primary` para texto sobre `--primary`.
- Iconos solos (sin texto) requieren `aria-label`.
- No usar `#000000` ni `#ffffff` puros.
