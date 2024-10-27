import useWebSocket from 'react-use-websocket';
import Canvas from '../components/shared/canvas/canvas';
import { useScreenSize } from '../hooks/shared.hooks';
import { getWebSocketURL, isMobileAgent } from '../utils/shared.utils';

const Sockets = () => {
  const [canvasWidth, canvasHeight] = useScreenSize();

  const { sendMessage } = useWebSocket(getWebSocketURL(), {
    onMessage: (event) => {
      const data: { x: number; y: number } = JSON.parse(event.data);
      const canvas = document.querySelector('canvas');
      if (canvas) {
        drawDot(data.x, data.y, canvas);
      }
    },
  });

  const drawDot = (x: number, y: number, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, 1, 1);
  };

  const handleMouseUp = (
    x: number,
    y: number,
    duration: number,
    canvas: HTMLCanvasElement,
  ) => {
    const isMobile = isMobileAgent();
    if (isMobile) {
      return;
    }
    sendMessage(JSON.stringify({ x, y, duration }));
    drawDot(x, y, canvas);
  };

  const handleTouchEnd = (
    x: number,
    y: number,
    duration: number,
    canvas: HTMLCanvasElement,
  ) => {
    sendMessage(JSON.stringify({ x, y, duration }));
    drawDot(x, y, canvas);
  };

  const handleRender = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
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
