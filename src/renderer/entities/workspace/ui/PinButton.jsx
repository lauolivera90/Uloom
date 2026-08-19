import { IconButton } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';

/**
 * Estrella de fijado de una sesión (favorito): botón de solo icono que alterna
 * `pinned`. Fijada (fill `primary`) es SIEMPRE visible porque comunica el estado
 * persistente; no fijada (ghost) puede ocultarse hasta el hover/foco del contenedor
 * con `appearOnHover` (patrón del play de la card: `opacity-0` conserva el slot,
 * se revela por `group-hover` y `focus-visible`, así el teclado la alcanza igual).
 * Con `appearOnHover={false}` (Detalle) queda siempre visible en ambos estados
 * (regla fill-vs-foreground de `design.md` §1). `aria-pressed` comunica el
 * estado y el `aria-label` es estable (`hub.pinSession`); el `title` cambia solo
 * como tooltip visual. StopPropagation en pointerdown/click para no propagar a
 * contenedores clickeables (la card del Hub). Lo comparten la card del Hub y el
 * header del Detalle.
 * @param {{
 *   pinned: boolean,
 *   onToggle: () => void,
 *   size?: 'md' | 'sm',
 *   appearOnHover?: boolean,
 *   className?: string,
 * }} props
 */
export function PinButton({ pinned = false, onToggle, size = 'md', appearOnHover = false, className = '' }) {
  const { t } = useI18n();

  return (
    <IconButton
      variant={pinned ? 'primary' : 'ghost'}
      icon={pinned ? 'star' : 'star_outline'}
      size={size}
      label={t('hub.pinSession')}
      title={t(pinned ? 'hub.unpinSession' : 'hub.pinSession')}
      aria-pressed={pinned}
      appearOnHover={appearOnHover}
      className={className}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    />
  );
}