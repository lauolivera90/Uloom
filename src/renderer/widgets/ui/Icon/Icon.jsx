const sizeClasses = { 16: 'text-[16px]', 20: 'text-[20px]', 24: 'text-[24px]' };

/**
 * Glifo de Material Symbols. Renderiza un span accesible (aria-hidden) como
 * decorativo. El tamaño default del sistema es 24px; 20px se usa para densidad
 * (colapsar); 16px para metadata compacta. El className se usa para color u
 * otros adornos (solo tokens).
 * @param {{
 *   icon: string,
 *   size?: 16 | 20 | 24,
 *   className?: string,
 * }} props
 */
export function Icon({ icon, size = 24, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${sizeClasses[size] || sizeClasses[24]}${
        className ? ` ${className}` : ''
      }`}
    >
      {icon}
    </span>
  );
}