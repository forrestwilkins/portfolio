import {
  Breakpoint,
  useColorScheme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import useWebSocket, { Options, ReadyState } from 'react-use-websocket';
import { getWebSocketURL } from '../utils/shared.utils';

export interface PubSubMessage<T = unknown> {
  request: 'PUBLISH' | 'SUBSCRIBE';
  channel: string;
  body?: T;
}

export const useSubscription = (channel: string, options: Options) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { sendMessage, readyState, ...rest } = useWebSocket(
    getWebSocketURL(),
    options,
  );

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

  return { sendMessage, readyState, isSubscribed, ...rest };
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
