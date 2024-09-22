import { useColorScheme } from '@mui/material';
import { useEffect, useState } from 'react';

export const useIsLightMode = () => {
  const { mode } = useColorScheme();
  return mode === 'light';
};

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

export const useBreakpoint = () => {
  const [screenWidth] = useScreenSize();

  const isSmall = screenWidth < 640;
  const isMedium = screenWidth >= 768;
  const isLarge = screenWidth >= 1024;

  return { isSmall, isMedium, isLarge };
};
