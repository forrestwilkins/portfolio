import { Breakpoint, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

// TODO: Add useIsLightMode hook

export const useColorScheme = () => {
  const { theme, setTheme } = useNextTheme();
  const [prefersDark, setPrefersDark] = useState(true);

  const isLight = () => {
    if (theme === 'system') {
      return !prefersDark;
    }
    return theme === 'light';
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return [isLight(), setTheme] as const;
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
