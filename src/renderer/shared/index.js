export { useMediaQuery } from './hook/useMediaQuery.js';
export { useCachedQuery } from './hook/useCachedQuery.js';
export { useIconPicker } from './hook/useIconPicker.js';
export { useConfirmAction } from './hook/useConfirmAction.js';
export { useI18n, I18nContext } from './hook/useI18n.js';
export { useToast, ToastContext } from './hook/useToast.js';
export {
  es,
  en,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  DICTIONARIES,
  normalizeLanguage,
  createTranslator,
  translateKey,
} from './lib/i18n/index.js';
export { getHostname, isCatalogIcon, isDataUrl, isRemoteIcon } from './lib/url.js';
export { PALETTES, normalizePalette } from './lib/palettes.js';
export { inferDuplicateName } from './lib/workspaceName.js';
export { buildTabsFromHistory } from './lib/historyTabs.js';
export { formatRelativeTime } from './lib/relativeTime.js';