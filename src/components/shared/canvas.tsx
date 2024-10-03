import { useIsDarkMode } from '@/hooks/shared.hooks';
import { Box, SxProps } from '@mui/material';
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';

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
  onMouseMove,
  onTouchMove,
  sx,
}: Props) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
        onFrameRender(canvas, frameCount);
        animationFrameId = window.requestAnimationFrame(render);
        frameCount++;
      };
      render();
    }
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [onFrameRender]);

  // Handle full screen toggle
  useEffect(() => {
    if (disableFullScreen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        setIsFullScreen((prev) => {
          if (prev) {
            document.exitFullscreen();
          } else {
            canvasRef.current?.requestFullscreen();
          }
          return !prev;
        });
      }
      if (e.code === 'Escape') {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disableFullScreen]);

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
        zIndex: fillViewport && !isFullScreen ? -1 : 1,
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
      onTouchMove={handleTouchMove}
      ref={canvasRef}
      sx={getStyles()}
    />
  );
};

export default Canvas;
