import { create } from 'zustand';

interface AppState {
  isAudioEnabled: boolean;
  isCanvasPaused: boolean;
  setIsAudioEnabled: (isAudioEnabled: boolean) => void;
  setIsCanvasPaused: (isCanvasPaused: boolean) => void;
}

const useAppStore = create<AppState>((set) => ({
  isAudioEnabled: false,
  isCanvasPaused: false,

  setIsAudioEnabled(isAudioEnabled) {
    set({ isAudioEnabled });
  },
  setIsCanvasPaused(isCanvasPaused) {
    set({ isCanvasPaused });
  },
}));

export default useAppStore;
