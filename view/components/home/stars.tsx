import { useEffect, useRef } from 'react';
import { useIsDarkMode } from '../../hooks/shared.hooks';

const Stars = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    let disposed = false;
    let stars: { stop: () => void } | undefined;

    const mount = async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const wasm = await import('../../wasm/stars_pkg/stars.js');
      if (disposed) {
        return;
      }

      await wasm.default();
      if (disposed) {
        return;
      }

      const layoutSeed = Math.random();
      stars = new wasm.Stars(canvas, isDarkMode, layoutSeed);
    };
    void mount();

    return () => {
      disposed = true;
      stars?.stop();
    };
  }, [isDarkMode]);

  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      ref={canvasRef}
    />
  );
};

export default Stars;
