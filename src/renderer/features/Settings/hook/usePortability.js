import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { exportAll as exportAllIpc } from '../../../entities/workspace/index.js';
import { useConfirmAction } from '../../../shared/index.js';

/**
 * Acciones de portabilidad y limpieza de Configuración → Sesiones: exportar todo
 * (respaldo `.json`), borrar la caché de metadatos (favicons) y eliminar todas
 * las sesiones con doble confirmación (primer diálogo de aviso + segundo diálogo
 * que delega su máquina de confirmación en `useConfirmAction`). Preservar
 * `preferences` al vaciar las sesiones lo resuelve el backend (`workspace:clearAll`).
 * Los errores se loguean con `console.error` (convención actual; sin toasts).
 * @returns {{
 *   isExportingAll: boolean,
 *   exportAll: () => Promise<void>,
 *   isClearingCache: boolean,
 *   clearCache: () => Promise<void>,
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
  const { clearMetadataCache, clearAllWorkspaces } = useWorkspaces();
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(false);

  const {
    isOpen: isSecondConfirmOpen,
    isRunning: isDeleting,
    request: requestFinal,
    cancel: cancelFinal,
    confirm: confirmDeleteAll,
  } = useConfirmAction({
    action: clearAllWorkspaces,
    errorMessage: 'Error al eliminar todas las sesiones:',
  });

  const exportAll = useCallback(async () => {
    if (isExportingAll) return;
    setIsExportingAll(true);
    try {
      await exportAllIpc();
    } catch (error) {
      console.error('Error al exportar todo:', error);
    } finally {
      setIsExportingAll(false);
    }
  }, [isExportingAll]);

  const clearCache = useCallback(async () => {
    if (isClearingCache) return;
    setIsClearingCache(true);
    try {
      await clearMetadataCache();
    } catch (error) {
      console.error('Error al borrar la caché de metadatos:', error);
    } finally {
      setIsClearingCache(false);
    }
  }, [isClearingCache, clearMetadataCache]);

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
    isExportingAll,
    exportAll,
    isClearingCache,
    clearCache,
    isDeleteOpen: isFirstOpen,
    isSecondConfirmOpen,
    isDeleting,
    requestDeleteAll,
    cancelDeleteAll,
    confirmFirstStep,
    confirmDeleteAll,
  };
}
