import { canvasRef } from '@/components/shared/canvas/canvas-ref';
import { clearCanvas } from '@/components/shared/canvas/canvas.utils';
import { useIsDarkMode } from '@/hooks/shared.hooks';
import useAppStore from '@/store/app.store';
import { Box, SxProps } from '@mui/material';
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';

const PROCESSED_POINT_TTL = 1000;
const PROCESSED_POINT_RADIUS = 20;

type LongPressMap = Record<
  number,
  {
    x: number;
    y: number;
    timestamp: number;
  }
>;

interface ProcessedPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface Props {
  width?: number;
  height?: number;
  disableFullScreen?: boolean;
  fillViewport?: boolean;
  onClick?(canvas: HTMLCanvasElement, e: MouseEvent<Element>): void;
  onFrameRender?(canvas: HTMLCanvasElement, frameCount: number): void;
  onMount?(canvas: HTMLCanvasElement): void;
  onMouseMove?(canvas: HTMLCanvasElement, e: MouseEvent<Element>): void;
  onTouchMove?(canvas: HTMLCanvasElement, e: TouchEvent<Element>): void;
  onLongTouchEnd?(x: number, y: number, duration: number): void;
  onTouch?(x: number, y: number): void;
  sx?: SxProps;
}

const Canvas = ({
  width = 250,
  height = 250,
  disableFullScreen,
  fillViewport,
  onClick,
  onLongTouchEnd,
  onFrameRender,
  onMount,
  onMouseMove,
  onTouchMove,
  onTouch,
  sx,
}: Props) => {
  const isCanvasPaused = useAppStore((state) => state.isCanvasPaused);
  const setIsCanvasPaused = useAppStore((state) => state.setIsCanvasPaused);

  const longPressesRef = useRef<LongPressMap>({});
  const processedPointsRef = useRef<ProcessedPoint[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const isDarkMode = useIsDarkMode();

  // On mount actions
  useEffect(() => {
    if (canvasRef.current) {
      if (isFullScreen || fillViewport) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      } else {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }

      if (onMount) {
        onMount(canvasRef.current);
      }
    }
  }, [onMount, width, height, isFullScreen, fillViewport]);

  // Handle frame rendering
  useEffect(() => {
    let frameCount = 1;
    let animationFrameId: number;

    if (canvasRef.current && onFrameRender) {
      const canvas = canvasRef.current;
      const render = () => {
        if (!isCanvasPaused) {
          onFrameRender(canvas, frameCount);
        }
        animationFrameId = window.requestAnimationFrame(render);
        frameCount++;
      };
      render();
    }
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [onFrameRender, isCanvasPaused]);

  // Handle full screen toggle
  useEffect(() => {
    if (disableFullScreen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          canvasRef.current?.requestFullscreen();
        }
      }
    };
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [disableFullScreen]);

  // Handle pause toggle and canvas clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvasRef.current) {
        return;
      }
      if (e.code === 'KeyP') {
        setIsCanvasPaused(!isCanvasPaused);
      }
      if (e.code === 'KeyC') {
        clearCanvas();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCanvasPaused, setIsCanvasPaused]);

  // Handle screen resize for full screen
  useEffect(() => {
    const handleScreenResize = () => {
      if (!canvasRef.current) {
        return;
      }
      if (isFullScreen || fillViewport) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleScreenResize);
    return () => window.removeEventListener('resize', handleScreenResize);
  }, [isFullScreen, fillViewport]);

  const getBackgroundColor = () => {
    if (fillViewport && !isFullScreen) {
      return;
    }
    if (isDarkMode) {
      return 'rgba(0, 0, 0, 0.95)';
    }
    return 'rgba(255, 255, 255, 0.95)';
  };

  const getStyles = (): Props['sx'] => {
    if (isFullScreen || fillViewport) {
      return {
        backgroundColor: getBackgroundColor(),
        position: 'fixed',
        top: 0,
        left: 0,
        ...sx,
      };
    }
    return sx;
  };

  const handleClick = (e: MouseEvent<Element>) => {
    if (canvasRef.current && onClick) {
      onClick(canvasRef.current, e);
    }
  };

  const handleTouchStart = (e: TouchEvent<Element>) => {
    if (canvasRef.current && onTouch) {
      const now = Date.now();

      // Clean up old processed points
      processedPointsRef.current = processedPointsRef.current.filter(
        (point) => now - point.timestamp < PROCESSED_POINT_TTL,
      );

      for (let i = 0; i < e.touches.length; i++) {
        const x = e.touches[i].clientX - canvasRef.current.offsetLeft;
        const y = e.touches[i].clientY - canvasRef.current.offsetTop;

        // Check if the point is too close to any processed point
        const isTooClose = processedPointsRef.current.some(
          (point) =>
            Math.abs(point.x - x) < PROCESSED_POINT_RADIUS &&
            Math.abs(point.y - y) < PROCESSED_POINT_RADIUS,
        );
        if (isTooClose) {
          continue;
        }

        onTouch(x, y);
        processedPointsRef.current.push({ x, y, timestamp: now });
        longPressesRef.current[e.touches[i].identifier] = {
          x,
          y,
          timestamp: now,
        };
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent<Element>) => {
    if (!canvasRef.current || !onLongTouchEnd) {
      return;
    }
    for (const touch of Array.from(e.changedTouches)) {
      const longPress = longPressesRef.current[touch.identifier];
      const duration = Date.now() - longPress.timestamp;
      if (duration > 500) {
        onLongTouchEnd(longPress.x, longPress.y, duration);
      }
      delete longPressesRef.current[touch.identifier];
    }
  };

  const handleMouseMove = (e: MouseEvent<Element>) => {
    if (canvasRef.current && onMouseMove) {
      onMouseMove(canvasRef.current, e);
    }
  };

  const handleTouchMove = (e: TouchEvent<Element>) => {
    if (canvasRef.current && onTouchMove) {
      onTouchMove(canvasRef.current, e);
    }
  };

  return (
    <Box
      component="canvas"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={canvasRef}
      sx={getStyles()}
    />
  );
};

export default Canvas;
