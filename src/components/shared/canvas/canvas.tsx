import { canvasRef } from '@/components/shared/canvas/canvas.refs';
import {
  RenderData,
  TouchPointMap,
} from '@/components/shared/canvas/canvas.types';
import { clearCanvas } from '@/components/shared/canvas/canvas.utils';
import { useIsDarkMode } from '@/hooks/shared.hooks';
import useAppStore from '@/store/app.store';
import { Box, SxProps } from '@mui/material';
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';

const TOUCH_POINT_RADIUS = 20;

interface Props {
  width?: number;
  height?: number;
  disableFullScreen?: boolean;
  fillViewport?: boolean;
  onFrameRender?(canvas: HTMLCanvasElement, renderData: RenderData): void;
  onMount?(canvas: HTMLCanvasElement): void;
  onMouseDown?(canvas: HTMLCanvasElement, e: MouseEvent<Element>): void;
  onMouseMove?(canvas: HTMLCanvasElement, e: MouseEvent<Element>): void;
  onMouseUp?(x: number, y: number, duration: number): void;
  onTouchStart?(x: number, y: number): void;
  onTouchEnd?(x: number, y: number, duration: number): void;
  onTouchMove?(canvas: HTMLCanvasElement, e: TouchEvent<Element>): void;
  sx?: SxProps;
}

const Canvas = ({
  width = 250,
  height = 250,
  disableFullScreen,
  fillViewport,
  onFrameRender,
  onMount,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
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
          onFrameRender(canvas, {
            touchPoints: touchPointsRef.current,
            frameCount,
          });
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

  const handleMouseDown = (e: MouseEvent<Element>) => {
    if (!canvasRef.current) {
      return;
    }
    if (onMouseDown) {
      onMouseDown(canvasRef.current, e);
    }
    touchPointsRef.current['click'] = {
      x: e.clientX - canvasRef.current.offsetLeft,
      y: e.clientY - canvasRef.current.offsetTop,
      timestamp: Date.now(),
    };
  };

  const handleMouseUp = (e: MouseEvent<Element>) => {
    const touchPoint = touchPointsRef.current['click'];
    const duration = Date.now() - touchPoint.timestamp;

    if (onMouseUp) {
      onMouseUp(e.clientX, e.clientY, duration);
    }
    delete touchPointsRef.current['click'];
  };

  const handleTouchStart = (e: TouchEvent<Element>) => {
    if (!canvasRef.current) {
      return;
    }
    const now = Date.now();

    for (const { clientX, clientY, identifier } of Array.from(e.touches)) {
      const x = clientX - canvasRef.current.offsetLeft;
      const y = clientY - canvasRef.current.offsetTop;

      // Check if the point is too close to any existing point
      const isTooClose = Object.values(touchPointsRef.current).some(
        (touchPoint) =>
          Math.abs(touchPoint.x - x) < TOUCH_POINT_RADIUS &&
          Math.abs(touchPoint.y - y) < TOUCH_POINT_RADIUS,
      );
      if (isTooClose) {
        continue;
      }
      if (onTouchStart) {
        onTouchStart(x, y);
      }
      const touchPoint = { x, y, timestamp: now };
      touchPointsRef.current[identifier] = touchPoint;
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
    if (!canvasRef.current) {
      return;
    }
    if (onTouchMove) {
      onTouchMove(canvasRef.current, e);
    }

    // Update touch points on move
    for (const { clientX, clientY, identifier } of Array.from(e.touches)) {
      const touchPoint = touchPointsRef.current[identifier];
      touchPoint.x = clientX - canvasRef.current.offsetLeft;
      touchPoint.y = clientY - canvasRef.current.offsetTop;
    }
  };

  return (
    <Box
      component="canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={canvasRef}
      sx={getStyles()}
    />
  );
};

export default Canvas;
