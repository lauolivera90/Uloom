/**
 * Patrón del sufijo numérico de duplicado: `nombre (N)` con N ≥ 1.
 * @type {RegExp}
 */
const DUPLICATE_SUFFIX = /^(.*)\s+\((\d+)\)$/;

/**
 * Escapa metacaracteres de regex en un string para usarlo como literal.
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Infiere el nombre sugerido para duplicar una sesión. Semántica `root (count)`:
 * si el nombre ya termina en ` (N)` se descarta el sufijo para obtener el root, y
 * el resultado es el root seguido de la cantidad de sesiones existentes cuyo
 * nombre es el root o `root (N)` — nunca se apilan sufijos (`hola (1)(1)` jamás)
 * y nunca colisiona con una sesión existente. `hola` → `hola (1)` → `hola (2)`.
 * @param {string} name Nombre de la sesión a duplicar.
 * @param {string[]} existingNames Nombres de todas las sesiones actuales.
 * @returns {string} Nombre sugerido para la copia.
 */
export function inferDuplicateName(name, existingNames) {
  const trimmed = name.trim();
  const root = (DUPLICATE_SUFFIX.exec(trimmed) ?? [null, trimmed])[1].trim();
  const variant = new RegExp(`^${escapeRegExp(root)}(?: \\((\\d+)\\))?$`);
  const count = existingNames.reduce(
    (total, current) => (variant.test(current.trim()) ? total + 1 : total),
    0,
  );
  return `${root} (${count})`;
}