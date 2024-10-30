import {
  Breakpoint,
  useColorScheme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ReadyState, SendMessage } from 'react-use-websocket';

export interface PubSubMessage<T = unknown> {
  request: 'PUBLISH' | 'SUBSCRIBE';
  channel: string;
  body?: T;
}

export const useSubscription = (
  channel: string,
  readyState: ReadyState,
  sendMessage: SendMessage,
) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (readyState !== ReadyState.OPEN) {
      setIsSubscribed(false);
      return;
    }

    const message: PubSubMessage = {
      request: 'SUBSCRIBE',
      channel,
    };
    sendMessage(JSON.stringify(message));
    setIsSubscribed(true);
  }, [readyState]);

  return isSubscribed;
};

export const useIsDarkMode = () => {
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);
  const { mode } = useColorScheme();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) =>
      setPrefersDarkMode(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (mode === 'system') {
    return prefersDarkMode;
  }

  return mode === 'dark';
};

export const useAboveBreakpoint = (breakpoint: Breakpoint) =>
  useMediaQuery(useTheme().breakpoints.up(breakpoint));

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return [screenSize.width, screenSize.height];
};
