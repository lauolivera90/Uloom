import { formElementStyles } from './formStyles.js';

/**
 * Input de texto controlado. Aplica el estilo compartido de formulario; el resto
 * de las props (id, type, value, onChange, placeholder, aria, etc.) se pasan
 * directo al elemento nativo.
 * @param {{ className?: string }} props
 */
export function TextInput({ className = '', ...props }) {
  return (
    <input {...props} className={`${formElementStyles}${className ? ` ${className}` : ''}`} />
  );
}