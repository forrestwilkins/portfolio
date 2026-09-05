import { useEffect, useRef } from 'react';
import { useIsDarkMode } from '../../hooks/shared.hooks';

/** A faint field of four-point stars that flash, drawn by the sparkles-wasm crate */
const Sparkles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    let disposed = false;
    let sparkles: { stop: () => void } | undefined;

    const mount = async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const wasm = await import('../../wasm/sparkles_pkg/sparkles_wasm.js');
      if (disposed) {
        return;
      }

      await wasm.default();
      if (disposed) {
        return;
      }

      // Seeded per mount, so the layout differs between page loads but is
      // fixed for the life of this one
      sparkles = new wasm.Sparkles(canvas, isDarkMode, Math.random());
    };
    void mount();

    return () => {
      disposed = true;
      sparkles?.stop();
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

export default Sparkles;
