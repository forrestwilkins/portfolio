import { create } from 'zustand';

interface AppState {
  isAudioEnabled: boolean;
  setIsAudioEnabled: (isAudioEnabled: boolean) => void;
}

const useAppStore = create<AppState>((set) => ({
  isAudioEnabled: false,

  setIsAudioEnabled(isAudioEnabled) {
    set({ isAudioEnabled });
  },
}));

export default useAppStore;
