import { formElementStyles } from './formStyles.js';
import { Icon } from '../Icon/Icon.jsx';

/**
 * Input de texto controlado. Aplica el estilo compartido de formulario; el resto
 * de las props (id, type, value, onChange, placeholder, aria, etc.) se pasan
 * directo al elemento nativo. Con `icon` (+ prop `iconPosition` opcional) envuelve
 * el input en un contenedor relativo con el glifo posicionado adentro y suma
 * padding del lado correspondiente; en ese caso el `className` dimensiona al
 * contenedor y el input queda `w-full` adentro. Presentacional.
 * @param {{
 *   className?: string,
 *   icon?: string,
 *   iconPosition?: 'left' | 'right',
 * }} props
 */
export function TextInput({ className = '', icon, iconPosition = 'left', ...props }) {
  if (!icon) {
    return <input {...props} className={`${formElementStyles}${className ? ` ${className}` : ''}`} />;
  }

  const isLeft = iconPosition === 'left';
  const paddingClass = isLeft ? 'pl-9' : 'pr-9';
  const iconAlign = isLeft ? 'left-2.5' : 'right-2.5';

  return (
    <span className={`relative inline-block${className ? ` ${className}` : ''}`}>
      <input {...props} className={`${formElementStyles} ${paddingClass}`} />
      <Icon
        icon={icon}
        size={20}
        className={`absolute ${iconAlign} top-1/2 -translate-y-1/2 text-text/40 pointer-events-none`}
      />
    </span>
  );
}