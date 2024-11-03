import { create } from 'zustand';

interface AppState {
  token: string | null;
  isAudioEnabled: boolean;
  isCanvasPaused: boolean;
  isAppLoading: boolean;
  setToken(token: string): void;
  setIsAudioEnabled(isAudioEnabled: boolean): void;
  setIsCanvasPaused(isCanvasPaused: boolean): void;
  setIsAppLoading(isAppLoading: boolean): void;
}

const useAppStore = create<AppState>((set) => ({
  token: null,
  isAppLoading: true,
  isAudioEnabled: false,
  isCanvasPaused: false,

  setToken(token) {
    set({ token });
  },
  setIsAppLoading(isAppLoading) {
    set({ isAppLoading });
  },
  setIsAudioEnabled(isAudioEnabled) {
    set({ isAudioEnabled });
  },
  setIsCanvasPaused(isCanvasPaused) {
    set({ isCanvasPaused });
  },
}));

export default useAppStore;
