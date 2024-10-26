import { useEffect } from 'react';
import { useScreenSize, useWebSocket } from '../hooks/shared.hooks';
import Canvas from '../components/shared/canvas/canvas';
import { isMobileAgent } from '../utils/shared.utils';

const Sockets = () => {
  const [canvasWidth, canvasHeight] = useScreenSize();
  const ws = useWebSocket();

  useEffect(() => {
    if (!ws) {
      return;
    }
    ws.onmessage = (event) => {
      console.log('Client received: ', event.data);
    };
  }, [ws]);

  const handleMouseUp = (x: number, y: number, duration: number) => {
    const isMobile = isMobileAgent();
    if (isMobile || !ws) {
      return;
    }
    ws.send(JSON.stringify({ x, y, duration }));
  };

  const handleTouchEnd = (x: number, y: number, duration: number) => {
    if (!ws) {
      return;
    }
    ws.send(JSON.stringify({ x, y, duration }));
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
