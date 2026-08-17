import { useCallback, useState } from 'react';
import { useI18n } from './useI18n.js';
import { useToast } from './useToast.js';

/**
 * Máquina de estados genérica de una confirmación destructiva/importante con
 * `ConfirmDialog`: apertura, cancelación con guard mientras corre y ejecución
 * pesimista de la acción con cierre solo ante éxito. Centraliza el patrón que
 * repetían `useDeleteWorkspace`, `useDeleteTab` y el delete-all de
 * `usePortability` (rules.md §4). Los errores se loguean con `console.error` y
 * emiten un toast de error localizado (`errorKey`) cuando se provee; `confirm`
 * devuelve `false` sin lanzar.
 * @param {{
 *   action: () => Promise<unknown>,
 *   errorMessage?: string,
 *   errorKey?: string,
 * }} props
 * @returns {{
 *   isOpen: boolean,
 *   isRunning: boolean,
 *   request: () => void,
 *   cancel: () => void,
 *   confirm: () => Promise<boolean>,
 * }}
 */
export function useConfirmAction({ action, errorMessage = 'Error', errorKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { t } = useI18n();
  const { toast } = useToast();

  const request = useCallback(() => setIsOpen(true), []);

  const cancel = useCallback(() => {
    if (isRunning) return;
    setIsOpen(false);
  }, [isRunning]);

  const confirm = useCallback(async () => {
    if (isRunning) return false;
    setIsRunning(true);
    try {
      await action();
      setIsOpen(false);
      return true;
    } catch (error) {
      console.error(errorMessage, error);
      if (errorKey) {
        toast({ variant: 'error', message: t(errorKey) });
      }
      return false;
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, action, errorMessage, errorKey, toast, t]);

  return { isOpen, isRunning, request, cancel, confirm };
}
