import { Icon } from '../Icon/Icon.jsx';
import { IconButton } from '../IconButton/IconButton.jsx';
import { useMenu } from '../../hooks/useMenu.js';

/**
 * @typedef {Object} MenuItem
 * @property {string} key Identificador único del item.
 * @property {string} label Texto visible del item (ya resuelto por `t()`, regla 9).
 * @property {string} [icon] Glifo Material Symbols líder.
 * @property {'default' | 'danger'} [variant] Semántica del item; `danger` para
 * acciones destructivas (token `error`).
 * @property {boolean} [disabled]
 * @property {() => void} onClick
 */

const ITEM_VARIANTS = {
  default: 'text-text hover:bg-primary/15 hover:text-primary-hover',
  danger: 'text-error hover:bg-error/10',
};

/**
 * Menú de overflow ("..."): un trigger IconButton `more_vert` que abre un popover
 * anclado debajo-a-la-derecha con acciones secundarias. Se abre por click (no
 * hover), cierra con click-fuera o Esc (que devuelve el foco al trigger) y se
 * navega con flechas (roving focus, primer item focalizado al abrir). El popover
 * vive en `bg-surface` con `z-[40]` — por debajo de modales (`z-50`) y toasts
 * (`z-[60]`). Los labels llegan ya resueltos por `t()`; el widget no traduce.
 * @param {{
 *   label: string,
 *   items: MenuItem[],
 * }} props
 */
export function Menu({ label, items }) {
  const { isOpen, toggle, close, containerRef, triggerRef, menuRef } = useMenu();

  const handleItemClick = (item) => {
    close();
    triggerRef.current?.focus();
    item.onClick?.();
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <IconButton
        ref={triggerRef}
        variant="ghost"
        icon="more_vert"
        label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggle}
      />
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          className="absolute right-0 top-full mt-2 w-48 p-1 border border-border bg-surface rounded-xl shadow-xl z-[40] duration-fast animate-in fade-in slide-in-from-top-2"
        >
          {items.map((item) => {
            const variant = ITEM_VARIANTS[item.variant ?? 'default'] ?? ITEM_VARIANTS.default;
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                className={`flex w-full items-center gap-2 px-3 py-2 rounded text-sm transition duration-fast active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-1 focus-visible:ring-offset-surface ${
                  item.disabled ? 'opacity-50 cursor-not-allowed' : `cursor-pointer ${variant}`
                }`}
              >
                {item.icon && <Icon icon={item.icon} size={16} className="flex-shrink-0" />}
                <span className="flex-1 min-w-0 text-left truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}