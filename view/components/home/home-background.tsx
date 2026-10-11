import { useEffect, useRef } from 'react';
import { useIsDarkMode } from '../../hooks/shared.hooks';
import useAppStore, { HomeBackground } from '../../store/app.store';

interface Animation {
  stop(): void;
}

interface AnimationPackage {
  default(): Promise<unknown>;
  create(canvas: HTMLCanvasElement, darkMode: boolean, seed: number): Animation;
}

// Each background is a separate WASM package, loaded only when selected
const loadPackage = async (
  background: HomeBackground,
): Promise<AnimationPackage> => {
  if (background === 'psychedelic') {
    const wasm = await import('../../wasm/psychedelic_pkg/psychedelic.js');
    return {
      default: wasm.default,
      create: (...args) => new wasm.Psychedelic(...args),
    };
  }
  const wasm = await import('../../wasm/stars_pkg/stars.js');
  return {
    default: wasm.default,
    create: (...args) => new wasm.Stars(...args),
  };
};

const HomeBackgroundCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const background = useAppStore((state) => state.homeBackground);
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    let disposed = false;
    let animation: Animation | undefined;

    const mount = async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const wasm = await loadPackage(background);
      if (disposed) {
        return;
      }

      await wasm.default();
      if (disposed) {
        return;
      }

      const layoutSeed = Math.random();
      animation = wasm.create(canvas, isDarkMode, layoutSeed);
    };
    void mount();

    return () => {
      disposed = true;
      animation?.stop();
    };
  }, [background, isDarkMode]);

  return (
    <canvas
      // Remount on switch so the next animation starts on a fresh canvas
      key={background}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      ref={canvasRef}
    />
  );
};

export default HomeBackgroundCanvas;
