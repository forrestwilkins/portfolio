// TODO: Ensure canvas responds to screen size changes
// TODO: Render canvas within an opaque container in full screen mode

import { Box, SxProps } from '@mui/material';
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';

interface Props {
  width?: number;
  height?: number;
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
  onClick,
  onFrameRender,
  onMount,
  onMouseMove,
  onTouchMove,
  sx,
}: Props) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // On mount actions
  useEffect(() => {
    if (canvasRef.current) {
      if (isFullScreen) {
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
  }, [onMount, width, height, isFullScreen]);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        setIsFullScreen(!isFullScreen);
      }
      if (e.code === 'Escape') {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getStyles = (): Props['sx'] => {
    if (isFullScreen) {
      return {
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
