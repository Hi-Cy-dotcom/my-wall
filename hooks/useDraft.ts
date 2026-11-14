import { useState, useEffect } from 'react';

const DRAFT_KEY = 'mywall_draft';

export function useDraft() {
  const [draft, setDraft] = useState('');

  // Load draft on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          setDraft(saved);
        }
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = (value: string) => {
    setDraft(value);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DRAFT_KEY, value);
      }
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  };

  // Clear draft
  const clearDraft = () => {
    setDraft('');
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch (e) {
      console.error('Failed to clear draft:', e);
    }
  };

  return { draft, saveDraft, clearDraft };
}
