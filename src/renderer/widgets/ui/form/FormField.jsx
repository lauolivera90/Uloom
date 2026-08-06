/**
 * Wrapper de un elemento de formulario. Muestra un label con asterisco si es
 * requerido y el cuerpo del elemento (cualquier contenido) con un gap de 2.
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
      {children}
      {errorMessage && <p className="text-xs text-error">{errorMessage}</p>}
    </div>
  );
}