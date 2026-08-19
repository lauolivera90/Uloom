/**
 * Formatea un timestamp ISO pasado a tiempo relativo localizado resolviendo
 * claves i18n con plurales (regla 9 — las cadenas viven en el diccionario, no
 * acá). Límites: <1 min → "Ahora mismo"; <1 h → minutos; <24 h → horas; <7 días
 * → días; <4 semanas → semanas; <12 meses → meses; el resto → años.
 * @param {string} iso ISO 8601 del evento pasado.
 * @param {(key: string, params?: Record<string, string | number>) => string} t
 * @returns {string}
 */
export function formatRelativeTime(iso, t) {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) {
    return t('time.now');
  }
  const diffMs = Math.max(0, Date.now() - time);
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (seconds < 60) return t('time.now');
  if (minutes < 60) return t('time.minute', { count: minutes });
  if (hours < 24) return t('time.hour', { count: hours });
  if (days < 7) return t('time.day', { count: days });
  if (weeks < 4) return t('time.week', { count: weeks });
  if (months < 12) return t('time.month', { count: months });
  return t('time.year', { count: years });
}