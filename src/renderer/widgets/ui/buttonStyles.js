/**
 * Estilos de color compartidos por Button e IconButton, estructurados por
 * base/hover/active para poder componer según estado. Helper interno de la capa
 * de widgets: no se expone en los barrels. Solo tokens del sistema.
 * @type {Record<string, { base: string, hover: string, active: string }>}
 */
export const buttonStyles = {
  primary: {
    base: 'bg-primary text-on-primary cursor-pointer',
    hover: 'hover:bg-primary-hover',
    active: 'active:scale-[0.98]',
  },
  secondary: {
    base: 'border border-border text-primary cursor-pointer',
    hover: '',
    active: 'active:scale-[0.98]',
  },
  ghost: {
    base: 'text-text cursor-pointer',
    hover: 'hover:bg-primary/15 hover:text-primary',
    active: 'active:scale-[0.98]',
  },
  warning: {
    base: 'bg-tertiary text-on-tertiary cursor-pointer',
    hover: '',
    active: 'active:scale-[0.98]',
  },
  danger: {
    base: 'bg-error text-on-error cursor-pointer',
    hover: '',
    active: 'active:scale-[0.98]',
  },
};

export { focusRing } from './focusRing.js';