const GAP_CLASSES = {
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
};

/**
 * Contenedor de formulario. Aplica el gutter (gap) vertical entre los elementos
 * y centraliza el preventDefault del submit. Presentacional: el onSubmit recibido
 * se invoca sin que el consumidor maneje el evento.
 * @param {{
 *   onSubmit?: (event: object) => void,
 *   gap?: number,
 *   className?: string,
 *   children: any,
 * }} props
 */
export function Form({ onSubmit, gap = 5, className = '', children, ...props }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
      className={`flex flex-col ${
        GAP_CLASSES[gap] || GAP_CLASSES[5]
      }${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </form>
  );
}