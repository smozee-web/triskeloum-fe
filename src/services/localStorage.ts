// src/services/courseStorage.service.ts
interface CourseDraftData {
    title: string;
    legend: string;
    est_time_min: number;
    level: string;
    category: string;
    published: boolean;
    sections: any[];
    coverPreview?: string;
    sectionCoverPreviews: { [key: number]: string };
    timestamp: number;
  }
  
  class CourseStorageService {
    private readonly DRAFT_KEY = 'course_draft';
    private readonly EXPIRY_DAYS = 7;
  
    saveDraft(data: Partial<CourseDraftData>): void {
      try {
        const existingDraft = this.getDraft();
        const draftData: any = {
          ...existingDraft,
          ...data,
          timestamp: Date.now()
        };
        
        localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draftData));
      } catch (error) {
        console.error('Error while saving the draft:', error);
      }
    }
  
    getDraft(): CourseDraftData | null {
      try {
        const draftJson = localStorage.getItem(this.DRAFT_KEY);
        if (!draftJson) return null;
  
        const draft: CourseDraftData = JSON.parse(draftJson);
        
        // Vérifier l'expiration
        const daysSinceLastSave = (Date.now() - draft.timestamp) / (1000 * 60 * 60 * 24);
        if (daysSinceLastSave > this.EXPIRY_DAYS) {
          this.clearDraft();
          return null;
        }
  
        return draft;
      } catch (error) {
        console.error('Error while retrieving the draft:', error);
        return null;
      }
    }
  
    clearDraft(): void {
      localStorage.removeItem(this.DRAFT_KEY);
    }
  
    hasDraft(): boolean {
      return this.getDraft() !== null;
    }
  }
  
  export const courseStorageService = new CourseStorageService();