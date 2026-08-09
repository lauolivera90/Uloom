/**
 * Contenedor estándar de página: columna con `gap-6` y padding `p-6`.
 * Override real por `className` (chequeo por regex `/(^|\s)p-/` y
 * `/(^|\s)gap-/`, ver design.md). Presentacional.
 * @param {{
 *   children: import('react').ReactNode,
 *   className: string,
 * }} props
 */
export function Page({ children, className = '', ...props }) {
  const resolvedPadding = /(^|\s)p-/.test(className) ? '' : 'p-6';
  const resolvedGap = /(^|\s)gap-/.test(className) ? '' : 'gap-6';

  return (
    <div className={`flex flex-col ${resolvedGap} ${resolvedPadding} ${className}`} {...props}>
      {children}
    </div>
  );
}