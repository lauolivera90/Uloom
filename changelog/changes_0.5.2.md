# Cambios 0.5.2

v0.5.2 — Temas personalizados (paletas de identidad). La app pasa de claro/oscuro a **modo × paleta**: se eligen 5 paletas predefinidas que redefinen los tokens de identidad (`primary`, `primary-hover`, `accent`, `on-primary`) en claro y oscuro, con preview en vivo en Configuración. Sin cambios backend.

## 1. Mecanismo `data-palette` (tokens palette-scoped)

- **`src/renderer/app/index.css`**: los tokens de identidad pasan a ser *palette-scoped*. `:root`/`.dark` conservan los estructurales (`text`, `background`, `surface`, `border`, `overlay`, `error`, `tertiary` y sus `on-*`) + la identidad base (violeta); bloques nuevos `[data-palette='<id>']` (claro) y `.dark[data-palette='<id>']` (oscuro) redefinen SOLO identidad por paleta. El atributo `data-palette` funciona en el `<html>` (paleta activa) o en cualquier subárbol (preview en vivo de un swatch — los custom properties heredan). Violeta también tiene bloque propio para que el preview de su swatch no herede la paleta activa de la app.
- **5 paletas**: `violeta` (default, valores actuales), `azul`, `esmeralda`, `ambar`, `rosa` — cada una con valores de identidad para claro y oscuro. **Contraste AA verificado numéricamente**: todas pasan ≥4.5:1 en `on/fill`, `hover/bg` y `accent/bg` (en ambos modos); los headers sobre `bg-accent/10` igualan el precedente violeta ya shippeado (4.08–4.14, headers `text-lg font-semibold`).
- **`public/theme-init.js`** (anti-flash): además de `.dark`, aplica `data-palette` al `<html>` antes del paint desde `uloom-palette`, validando contra un allowlist (default `violeta`). El allowlist es un snapshot que debe sincronizarse con el catálogo (⚠️ documentado en los tres archivos).
- **`shared/lib/palettes.js`** (nuevo, vía `shared/index.js`): catálogo `PALETTES = [{ id, labelKey }]` + `normalizePalette(id)` con fallback al default. **Sin colores** — el CSS es la única fuente de verdad; el catálogo solo ordena ids y claves de etiqueta i18n.

## 2. Runtime del tema ampliado

- **`app/hook/useTheme.js`**: `useThemeState` ahora maneja también la paleta: `getInitialPalette()` siembra desde `documentElement.dataset.palette` (validado con `normalizePalette`), `setPalette(id)` muta el atributo y persiste `uloom-palette`. Retorno: `{ theme, setTheme, toggleTheme, palette, setPalette }`. La persistencia se generalizó en `persistPreference(key, value)`.
- **`app/ThemeProvider.jsx`**: solo JSDoc — el context ahora expone `palette`/`setPalette`.
- Cambio de paleta es in-place y visible → sin toast (regla 10).

## 3. Selector en Configuración

- **`widgets/ui/PalettePicker/PalettePicker.jsx`** (nuevo, vía barrels de widgets): grilla de swatches circulares (`w-7 h-7`, preview partido primary/accent) donde cada botón lleva `data-palette={id}` para que el preview use tokens puros sin duplicar colores. Selección única con semántica de radio group (`role="radiogroup"` + `role="radio"`/`aria-checked`), `aria-label`/`title` por swatch, `focusRing` + `active:scale` estándar. Presentacional: recibe `label`, `palettes` (`[{id, label}]`), `value` y `onChange`.
- **`features/Settings/hook/useSettings.js`**: expone `palette`/`setPalette` desde `useTheme` (JSDoc actualizado).
- **`features/Settings/ui/SettingsView.jsx`**: nueva fila "Paleta de colores" en Preferencias (debajo del toggle de Tema) con `PalettePicker` como control; `paletteOptions` mapea el catálogo a labels resueltos por `t(palette.labelKey)`.

## 4. i18n

7 claves nuevas con paridad es/en: `settings.palette`, `settings.paletteDescription` y los 5 nombres `settings.paletteVioleta/Azul/Esmeralda/Ambar/Rosa`. Ningún nombre de paleta hardcodeado en JSX.

## Auditoría (@reviewer)

Sin hallazgos M. Se aplicaron los L: `aria-pressed` → semántica radio group (`role="radiogroup"`/`role="radio"`/`aria-checked`, a11y de selección única), `aria-label` del group como prop `label` resuelta por `t()` (regla 9) en vez de string literal, y `DEFAULT_PALETTE` fuera del barrel de `shared` (sin consumidor externo — regla 5). Riesgo documentado (no corregido, deuda deliberada): el allowlist del anti-flash debe sincronizarse a mano con el catálogo si se agregan paletas. `npm run lint` en verde y build del renderer OK.

## Docs

- `.doc/design.md` §1: bullet nuevo de "Paletas de identidad (v0.5.2)" (mecanismo `data-palette`, persistencia, sincronización del allowlist) + nota en la tabla de tokens (identidad = palette-scoped, estructurales no). §3: bullet del widget `PalettePicker` (grilla, preview por `data-palette`, radio group, tokens).
- `.doc/architecture.md`: `palettes.js` en el árbol de `shared/lib/` y `PalettePicker` en `widgets/ui/`.
- Sin cambios backend/IPC → `backend.md`/`config_file.md` solo con bump de header/default.

## Estado

- Lo hecho: el item v0.5.2 de `Plan/to_do.md` en `[x]` (paletas predefinidas de identidad con selector en Configuración). Cierre ejecutado: bump de versión en `package.json`/`package-lock.json`/`APP_VERSION` (`src/main/data/configStore.js`) y headers de `.doc/*` (`.doc/architecture.md`, `.doc/backend.md`, `.doc/config_file.md` con su default), `AGENTS.md` (sección "Fase actual") actualizado, changelog completado y roadmap verificado. Verificación de lint OK. No se publicó pre-release (app local de escritorio).
- Fuera de esta fase: personalización manual de colores (picker de color, mayor alcance) y paletas que redefinan tokens estructurales (temas completos) — no documentados como planificados.