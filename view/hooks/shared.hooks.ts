import {
  Breakpoint,
  useColorScheme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import useWebSocket, { Options } from 'react-use-websocket';
import useAppStore from '../store/app.store';
import { getWebSocketURL } from '../utils/shared.utils';

export interface PubSubMessage<T = unknown> {
  request: 'PUBLISH' | 'SUBSCRIBE' | 'UNSUBSCRIBE';
  channel: string;
  token: string;
  body?: T;
}

export const useSubscription = (channel: string, options?: Options) => {
  const token = useAppStore((state) => state.token);

  const getOptions = () => {
    if (!options || !options.onMessage) {
      return options;
    }
    // Ignore messages from other channels
    const onMessage = (event: MessageEvent) => {
      const message: PubSubMessage = JSON.parse(event.data);
      if (message.channel !== channel || !options.onMessage) {
        return;
      }
      options.onMessage(event);
    };
    return { ...options, onMessage };
  };

  const { sendMessage, ...rest } = useWebSocket(getWebSocketURL(), {
    onOpen: () => {
      if (!token) {
        return;
      }
      const message: PubSubMessage = {
        request: 'SUBSCRIBE',
        channel,
        token,
      };
      sendMessage(JSON.stringify(message));
    },
    shouldReconnect: () => !!token,
    share: true,
    ...getOptions(),
  });

  return { sendMessage, ...rest };
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
