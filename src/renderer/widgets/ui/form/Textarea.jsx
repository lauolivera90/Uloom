import { formElementStyles } from './formStyles.js';

/**
 * Textarea controlado. Aplica el estilo compartido de formulario; el resto de las
 * props (id, value, onChange, placeholder, aria, etc.) se pasan directo al
 * elemento nativo.
 * @param {{
 *   rows?: number,
 *   className?: string,
 * }} props
 */
export function Textarea({ rows = 4, className = '', ...props }) {
  return (
    <textarea
      rows={rows}
      {...props}
      className={`${formElementStyles}${className ? ` ${className}` : ''}`}
    />
  );
}