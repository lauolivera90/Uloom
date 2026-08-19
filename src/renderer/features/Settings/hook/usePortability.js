import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { exportAll as exportAllIpc } from '../../../entities/workspace/index.js';
import { useConfirmAction, useI18n, useToast } from '../../../shared/index.js';

/**
 * Mapeo de códigos de error de importación (contrato IPC, ver
 * `PORTABILITY_ERROR_CODES` en portabilityService) a claves i18n del feedback
 * visual. Los fallos sin código caen en el genérico.
 * @type {Record<string, string>}
 */
const IMPORT_ERROR_KEYS = {
  INVALID_JSON: 'import.errorInvalidJson',
  NOT_ULOOLM_FILE: 'import.errorNotUloom',
  UNSUPPORTED_KIND: 'import.errorUnsupportedKind',
  INVALID_SCHEMA_VERSION: 'import.errorInvalidSchema',
  INVALID_WORKSPACES: 'import.errorInvalidSessions',
  READ_ERROR: 'import.errorRead',
  PERSIST_ERROR: 'import.errorPersist',
};

/**
 * Acciones de portabilidad y limpieza de Configuración → Sesiones: importar
 * sesiones desde un `.json` (el main agrega las individuales o reemplaza el
 * catálogo ante un respaldo; cancelar el diálogo no es un error), exportar todo
 * (respaldo `.json`), borrar la caché de metadatos (favicons), borrar el
 * historial de pestañas usadas y eliminar todas las sesiones con doble
 * confirmación (primer diálogo de aviso + segundo diálogo que delega su máquina
 * de confirmación en `useConfirmAction`). Preservar `preferences` al vaciar las
 * sesiones lo resuelve el backend (`workspace:clearAll`).
 * Cada acción emite feedback visual (toast) de éxito y de error; los errores de
 * importación se mapean por código de error del backend a mensajes localizados.
 * @returns {{
 *   isImporting: boolean,
 *   importSessions: () => Promise<void>,
 *   isExportingAll: boolean,
 *   exportAll: () => Promise<void>,
 *   isClearingCache: boolean,
 *   clearCache: () => Promise<void>,
 *   isClearingHistory: boolean,
 *   clearHistory: () => Promise<void>,
 *   isDeleteOpen: boolean,
 *   isSecondConfirmOpen: boolean,
 *   isDeleting: boolean,
 *   requestDeleteAll: () => void,
 *   cancelDeleteAll: () => void,
 *   confirmFirstStep: () => void,
 *   confirmDeleteAll: () => Promise<boolean>,
 * }}
 */
export function usePortability() {
  const { clearMetadataCache, clearAllWorkspaces, importWorkspaces, clearTabHistory } = useWorkspaces();
  const { t } = useI18n();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(false);

  const {
    isOpen: isSecondConfirmOpen,
    isRunning: isDeleting,
    request: requestFinal,
    cancel: cancelFinal,
    confirm: confirmDeleteAllBase,
  } = useConfirmAction({
    action: clearAllWorkspaces,
    errorMessage: 'Error al eliminar todas las sesiones:',
    errorKey: 'deleteAll.error',
  });

  const importSessions = useCallback(async () => {
    if (isImporting) return;
    setIsImporting(true);
    try {
      const { canceled, imported } = await importWorkspaces();
      if (!canceled) {
        toast({ variant: 'success', message: t('import.success', { count: imported }) });
      }
    } catch (error) {
      console.error('Error al importar sesiones:', error);
      const message = t(IMPORT_ERROR_KEYS[error?.code] ?? 'import.errorGeneric');
      toast({ variant: 'error', message });
    } finally {
      setIsImporting(false);
    }
  }, [isImporting, importWorkspaces, toast, t]);

  const exportAll = useCallback(async () => {
    if (isExportingAll) return;
    setIsExportingAll(true);
    try {
      const { canceled } = await exportAllIpc();
      if (!canceled) {
        toast({ variant: 'success', message: t('export.success') });
      }
    } catch (error) {
      console.error('Error al exportar todo:', error);
      toast({ variant: 'error', message: t('export.error') });
    } finally {
      setIsExportingAll(false);
    }
  }, [isExportingAll, toast, t]);

  const clearCache = useCallback(async () => {
    if (isClearingCache) return;
    setIsClearingCache(true);
    try {
      await clearMetadataCache();
      toast({ variant: 'success', message: t('cache.success') });
    } catch (error) {
      console.error('Error al borrar la caché de metadatos:', error);
      toast({ variant: 'error', message: t('cache.error') });
    } finally {
      setIsClearingCache(false);
    }
  }, [isClearingCache, clearMetadataCache, toast, t]);

  const clearHistory = useCallback(async () => {
    if (isClearingHistory) return;
    setIsClearingHistory(true);
    try {
      await clearTabHistory();
      toast({ variant: 'success', message: t('history.clear.success') });
    } catch (error) {
      console.error('Error al borrar el historial de pestañas:', error);
      toast({ variant: 'error', message: t('history.clear.error') });
    } finally {
      setIsClearingHistory(false);
    }
  }, [isClearingHistory, clearTabHistory, toast, t]);

  const confirmDeleteAll = useCallback(async () => {
    const ok = await confirmDeleteAllBase();
    if (ok) {
      toast({ variant: 'success', message: t('deleteAll.success') });
    }
    return ok;
  }, [confirmDeleteAllBase, toast, t]);

  const requestDeleteAll = useCallback(() => setIsFirstOpen(true), []);

  const cancelDeleteAll = useCallback(() => {
    setIsFirstOpen(false);
    cancelFinal();
  }, [cancelFinal]);

  const confirmFirstStep = useCallback(() => {
    setIsFirstOpen(false);
    requestFinal();
  }, [requestFinal]);

  return {
    isImporting,
    importSessions,
    isExportingAll,
    exportAll,
    isClearingCache,
    clearCache,
    isClearingHistory,
    clearHistory,
    isDeleteOpen: isFirstOpen,
    isSecondConfirmOpen,
    isDeleting,
    requestDeleteAll,
    cancelDeleteAll,
    confirmFirstStep,
    confirmDeleteAll,
  };
}