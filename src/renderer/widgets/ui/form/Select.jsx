import { formElementStyles } from './formStyles.js';

/**
 * Select controlado construido a partir de un array de opciones. Un placeholder
 * opcional se muestra como primer option con valor vacío. El resto de las props
 * (id, value, onChange, aria, etc.) se pasan directo al elemento nativo.
 * @param {{
 *   options: Array<{ value: string, label: string }>,
 *   placeholder?: string,
 *   className?: string,
 * }} props
 */
export function Select({ options, placeholder = '', className = '', ...props }) {
  return (
    <select {...props} className={`${formElementStyles}${className ? ` ${className}` : ''}`}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}