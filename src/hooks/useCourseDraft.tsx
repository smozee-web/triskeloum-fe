// src/hooks/useCourseDraft.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { courseDraftService } from '../services/courseDraft';

export const useCourseDraft = () => {
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHasDraft(courseDraftService.hasDraft());
  }, []);

  const loadDraft = useCallback(async () => {
    try {
      const draft = await courseDraftService.loadDraft();
      setIsDraftLoaded(true);
      return draft;
    } catch (error) {
      console.error('Error while loading the draft:', error);
      toast.error('Error while loading the draft');
      return null;
    }
  }, []);

  const saveDraft = useCallback(async (data: any, files: { [key: string]: File }) => {
    try {
      setIsSaving(true);
      await courseDraftService.saveDraft(data, files);
      setHasDraft(true);
    } catch (error) {
      console.error('Error while saving the draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const clearDraft = useCallback(async () => {
    try {
      await courseDraftService.clearDraft();
      setHasDraft(false);
      toast.success('Draft deleted');
    } catch (error) {
      console.error('Error while deleting the draft:', error);
      toast.error('Error while deleting the draft');
    }
  }, []);

  return {
    hasDraft,
    isDraftLoaded,
    isSaving,
    loadDraft,
    saveDraft,
    clearDraft
  };
};