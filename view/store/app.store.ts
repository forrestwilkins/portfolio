import { create } from 'zustand';

export type HomeBackground = 'stars' | 'psychedelic';

const HOME_BACKGROUND_KEY = 'homeBackground';

const readHomeBackground = (): HomeBackground => {
  try {
    const stored = localStorage.getItem(HOME_BACKGROUND_KEY);
    return stored === 'psychedelic' ? stored : 'stars';
  } catch {
    return 'stars';
  }
};

interface AppState {
  token: string | null;
  isAudioEnabled: boolean;
  isCanvasPaused: boolean;
  isAppLoading: boolean;
  homeBackground: HomeBackground;
  setToken(token: string): void;
  setIsAudioEnabled(isAudioEnabled: boolean): void;
  setIsCanvasPaused(isCanvasPaused: boolean): void;
  setIsAppLoading(isAppLoading: boolean): void;
  setHomeBackground(homeBackground: HomeBackground): void;
}

const useAppStore = create<AppState>((set) => ({
  token: null,
  isAppLoading: true,
  isAudioEnabled: false,
  isCanvasPaused: false,
  homeBackground: readHomeBackground(),

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
  setHomeBackground(homeBackground) {
    try {
      localStorage.setItem(HOME_BACKGROUND_KEY, homeBackground);
    } catch {
      // Storage can be unavailable, e.g. in private browsing
    }
    set({ homeBackground });
  },
}));

export default useAppStore;
