import { canvasRef } from '@/components/shared/canvas/canvas-ref';
import { clearCanvas } from '@/components/shared/canvas/canvas.utils';
import { useIsDarkMode } from '@/hooks/shared.hooks';
import useAppStore from '@/store/app.store';
import { Box, SxProps } from '@mui/material';
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';

const TOUCH_POINT_TTL = 1000;
const TOUCH_POINT_RADIUS = 20;

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

type TouchPointMap = Record<number, TouchPoint>;

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
  onTouchEnd?(x: number, y: number, duration: number): void;
  onTouch?(x: number, y: number): void;
  sx?: SxProps;
}

const Canvas = ({
  width = 250,
  height = 250,
  disableFullScreen,
  fillViewport,
  onClick,
  onFrameRender,
  onMount,
  onTouchEnd,
  onMouseMove,
  onTouchMove,
  onTouch,
  sx,
}: Props) => {
  const isCanvasPaused = useAppStore((state) => state.isCanvasPaused);
  const setIsCanvasPaused = useAppStore((state) => state.setIsCanvasPaused);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const touchPointsRef = useRef<TouchPointMap>({});

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
    if (canvasRef.current) {
      const now = Date.now();

      // Clean up old processed points
      for (const touchPoint of Object.values(touchPointsRef.current)) {
        if (now - touchPoint.timestamp > TOUCH_POINT_TTL) {
          delete touchPointsRef.current[touchPoint.timestamp];
        }
      }

      for (let i = 0; i < e.touches.length; i++) {
        const x = e.touches[i].clientX - canvasRef.current.offsetLeft;
        const y = e.touches[i].clientY - canvasRef.current.offsetTop;

        // Check if the point is too close to any existing point
        const isTooClose = Object.values(touchPointsRef.current).some(
          (touchPoint) =>
            Math.abs(touchPoint.x - x) < TOUCH_POINT_RADIUS &&
            Math.abs(touchPoint.y - y) < TOUCH_POINT_RADIUS,
        );
        if (isTooClose) {
          continue;
        }
        if (onTouch) {
          onTouch(x, y);
        }
        const touchPoint = { x, y, timestamp: now };
        touchPointsRef.current[e.touches[i].identifier] = touchPoint;
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent<Element>) => {
    if (!canvasRef.current) {
      return;
    }
    for (const touch of Array.from(e.changedTouches)) {
      const touchPoint = touchPointsRef.current[touch.identifier];
      const duration = Date.now() - touchPoint.timestamp;
      if (onTouchEnd) {
        onTouchEnd(touch.clientX, touch.clientY, duration);
      }
      delete touchPointsRef.current[touch.identifier];
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
