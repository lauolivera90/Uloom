import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Estado del widget Menu: apertura/cierre del popover por click (no hover),
 * cierre con click-fuera o Esc (que devuelve el foco al trigger), foco en el
 * primer item al abrir y navegación con flechas entre items (roving focus).
 * Los listeners de documento se registran solo mientras el menú está abierto y
 * se limpian al desmontar o cerrar (regla 2.2).
 * @returns {{
 *   isOpen: boolean,
 *   toggle: () => void,
 *   close: () => void,
 *   containerRef: import('react').RefObject<HTMLDivElement>,
 *   triggerRef: import('react').RefObject<HTMLButtonElement>,
 *   menuRef: import('react').RefObject<HTMLDivElement>,
 * }}
 */
export function useMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  useEffect(() => {
    if (!isOpen) return;

    menuRef.current?.querySelector('[role="menuitem"]:not([disabled])')?.focus();

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      if (!menuRef.current?.contains(document.activeElement)) return;
      const items = Array.from(
        menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])'),
      );
      if (items.length === 0) return;
      const currentIndex = items.indexOf(document.activeElement);
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + direction + items.length) % items.length;
      event.preventDefault();
      items[nextIndex]?.focus();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return { isOpen, toggle, close, containerRef, triggerRef, menuRef };
}