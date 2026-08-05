export function Button({
  variant = 'primary',
  disabled = false,
  className = '',
  children,
  icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-5 py-1.5 text-sm font-medium rounded transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background';

  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90 cursor-pointer active:scale-[0.98]',
    secondary: 'border border-primary/30 text-primary hover:bg-primary/10 cursor-pointer active:scale-[0.98]',
    ghost: 'text-text hover:bg-primary/10 cursor-pointer active:scale-[0.98]',
    warning: 'bg-tertiary text-on-tertiary hover:bg-tertiary/90 cursor-pointer active:scale-[0.98]',
    danger: 'bg-error text-on-error hover:bg-error/90 cursor-pointer active:scale-[0.98]',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${baseStyles}${variants[variant]}${
        disabled ? ' opacity-50 cursor-not-allowed' : ''
      }${className ? ` ${className}` : ''}`}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="material-symbols-outlined">
          {icon}
        </span>
      ) : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
