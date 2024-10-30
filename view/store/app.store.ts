import { create } from 'zustand';

interface AppState {
  token: string | null;
  isAudioEnabled: boolean;
  isCanvasPaused: boolean;
  setToken(token: string): void;
  setIsAudioEnabled(isAudioEnabled: boolean): void;
  setIsCanvasPaused(isCanvasPaused: boolean): void;
}

const useAppStore = create<AppState>((set) => ({
  token: null,
  isAudioEnabled: false,
  isCanvasPaused: false,

  setToken(token) {
    set({ token });
  },
  setIsAudioEnabled(isAudioEnabled) {
    set({ isAudioEnabled });
  },
  setIsCanvasPaused(isCanvasPaused) {
    set({ isCanvasPaused });
  },
}));

export default useAppStore;
