import { cloneElement, isValidElement } from 'react';

/**
 * Wrapper de un elemento de formulario. Muestra un label con asterisco si es
 * requerido y el cuerpo del elemento (cualquier contenido) con un gap de 2.
 * Si `required` es true y el hijo es un elemento (p. ej. TextInput/Select/Textarea),
 * le propaga el estado `required` y `aria-required` para que el control nativo lo
 * anuncie; si el hijo no es un elemento o el campo no es requerido, no lo toca.
 * @param {{
 *   label?: string,
 *   required?: boolean,
 *   htmlFor?: string,
 *   errorMessage?: string,
 *   className?: string,
 *   children: any,
 * }} props
 */
export function FormField({
  label = '',
  required = false,
  htmlFor,
  errorMessage = '',
  className = '',
  children,
}) {
  const showLabel = label !== '';
  const control =
    required && isValidElement(children)
      ? cloneElement(children, { required: true, 'aria-required': 'true' })
      : children;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-text">
          {label}
          {required && (
            <span aria-hidden="true" className="text-error ml-0.5">
              *
            </span>
          )}
        </label>
      )}
      {control}
      {errorMessage && <p className="text-xs text-error">{errorMessage}</p>}
    </div>
  );
}