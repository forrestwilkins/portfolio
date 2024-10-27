import { useCallback, useEffect } from 'react';
import { useScreenSize, useWebSocket } from '../hooks/shared.hooks';
import Canvas from '../components/shared/canvas/canvas';
import { isMobileAgent } from '../utils/shared.utils';

const Sockets = () => {
  const [canvasWidth, canvasHeight] = useScreenSize();
  const ws = useWebSocket();

  const drawDot = useCallback(
    (x: number, y: number, canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.fillStyle = 'white';
      ctx.fillRect(x, y, 1, 1);
    },
    [],
  );

  useEffect(() => {
    if (!ws) {
      return;
    }
    ws.onmessage = (event) => {
      const data: { x: number; y: number } = JSON.parse(event.data);
      const canvas = document.querySelector('canvas');
      if (canvas) {
        drawDot(data.x, data.y, canvas);
      }
    };
  }, [ws, drawDot]);

  const handleMouseUp = (
    x: number,
    y: number,
    duration: number,
    canvas: HTMLCanvasElement,
  ) => {
    const isMobile = isMobileAgent();
    if (isMobile || !ws) {
      return;
    }
    ws.send(JSON.stringify({ x, y, duration }));
    drawDot(x, y, canvas);
  };

  const handleTouchEnd = (
    x: number,
    y: number,
    duration: number,
    canvas: HTMLCanvasElement,
  ) => {
    if (!ws) {
      return;
    }
    ws.send(JSON.stringify({ x, y, duration }));
    drawDot(x, y, canvas);
  };

  const handleRender = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !ws) {
      return;
    }
  };

  return (
    <Canvas
      width={canvasWidth}
      height={canvasHeight}
      onFrameRender={handleRender}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      fillViewport
    />
  );
};

export default Sockets;
