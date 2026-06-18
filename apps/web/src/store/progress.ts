import { create } from 'zustand';
import type { ProgressStatus } from '@skillatlas/shared';

interface ProgressState {
  entries: Record<string, ProgressStatus>;
  setEntries: (entries: Record<string, ProgressStatus>) => void;
  setEntry: (skillId: string, status: ProgressStatus | null) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  entries: {},
  setEntries: (entries) => set({ entries }),
  setEntry: (skillId, status) =>
    set((state) => {
      const next = { ...state.entries };
      if (status === null) {
        delete next[skillId];
      } else {
        next[skillId] = status;
      }
      return { entries: next };
    }),
}));
