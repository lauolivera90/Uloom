import { focusRing } from '../focusRing.js';

/**
 * Selector de paleta de identidad: grilla de swatches circulares que muestran en
 * vivo los colores de cada paleta (primary + accent). Cada botón lleva el
 * atributo `data-palette={id}`, de modo que los tokens de `index.css`
 * (`[data-palette=...]`) se resuelven dentro de su subárbol y el preview usa
 * SOLO tokens (sin duplicar colores en JS). Presentacional: los valores y el
 * callback llegan por props. Selección única → semántica de radio group
 * (`role="radiogroup"` + `role="radio"`/`aria-checked`); los swatches solos
 * requieren nombre accesible → `aria-label` y `title` con el label.
 * @param {{
 *   label: string,
 *   palettes: Array<{ id: string, label: string }>,
 *   value: string,
 *   onChange: (id: string) => void,
 * }} props
 */
export function PalettePicker({ label, palettes, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-2">
      {palettes.map((palette) => {
        const isSelected = palette.id === value;
        return (
          <button
            key={palette.id}
            type="button"
            role="radio"
            data-palette={palette.id}
            aria-checked={isSelected}
            aria-label={palette.label}
            title={palette.label}
            onClick={() => onChange(palette.id)}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition duration-fast active:scale-[0.98] ${
              isSelected
                ? 'ring-2 ring-primary-hover ring-offset-2 ring-offset-background'
                : 'border border-border hover:border-primary-hover'
            } ${focusRing}`}
          >
            <span className="flex w-4 h-4 rounded-full overflow-hidden" aria-hidden="true">
              <span className="w-1/2 h-full bg-primary" />
              <span className="w-1/2 h-full bg-accent" />
            </span>
          </button>
        );
      })}
    </div>
  );
}