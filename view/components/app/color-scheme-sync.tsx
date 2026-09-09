import { useLayoutEffect } from 'react';
import { useIsDarkMode } from '../../hooks/shared.hooks';

/**
 * Mirrors the MUI color scheme onto a `dark` class so Tailwind's dark variant
 * follows the same toggle. Runs in a layout effect to avoid a flash of the
 * light palette on first paint.
 */
const ColorSchemeSync = () => {
  const isDarkMode = useIsDarkMode();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return null;
};

export default ColorSchemeSync;
