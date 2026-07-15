// src/hooks/useAutoSave.ts
import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  onSave: (data: any, files: { [key: string]: File }) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = (
  data: any,
  files: { [key: string]: File },
  options: UseAutoSaveOptions
) => {
  const { onSave, delay = 3000, enabled = true } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  // Créer une fonction stable de sauvegarde
  const saveData = useCallback(async () => {
    if (isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      await onSave(data, files);
      lastSavedRef.current = JSON.stringify(data);
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, files, onSave]);

  useEffect(() => {
    // Skip sur le premier render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // Skip si désactivé
    if (!enabled) return;

    // Comparer avec la dernière sauvegarde
    const currentDataString = JSON.stringify(data);
    if (currentDataString === lastSavedRef.current) {
      return;
    }

    // Clear timeout existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Créer nouveau timeout
    timeoutRef.current = setTimeout(() => {
      saveData();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, files, delay, enabled, saveData]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isSaving: isSavingRef.current };
};