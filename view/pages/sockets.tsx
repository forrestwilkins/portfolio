import useWebSocket from 'react-use-websocket';
import Canvas from '../components/shared/canvas/canvas';
import { useIsDarkMode, useScreenSize } from '../hooks/shared.hooks';
import { getWebSocketURL, isMobileAgent } from '../utils/shared.utils';

const Sockets = () => {
  const [canvasWidth, canvasHeight] = useScreenSize();
  const isDarkMode = useIsDarkMode();

  const { sendMessage } = useWebSocket(getWebSocketURL(), {
    onMessage: (event) => {
      const { body }: { body: { x: number; y: number } } = JSON.parse(
        event.data,
      );
      const canvas = document.querySelector('canvas');
      if (canvas) {
        drawDot(body.x, body.y, canvas);
      }
    },
    onOpen(event) {
      (event.target as WebSocket).send(
        JSON.stringify({
          channel: 'sockets',
          request: 'SUBSCRIBE',
        }),
      );
    },
  });

  const drawDot = (x: number, y: number, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.fillStyle = isDarkMode ? 'white' : 'black';
    ctx.fillRect(x, y, 1, 1);
  };

  const sendDot = (x: number, y: number, duration: number) => {
    const message = {
      channel: 'sockets',
      request: 'PUBLISH',
      body: { x, y, duration },
    };
    sendMessage(JSON.stringify(message));
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
    drawDot(x, y, canvas);
    sendDot(x, y, duration);
  };

  const handleTouchEnd = (
    x: number,
    y: number,
    duration: number,
    canvas: HTMLCanvasElement,
  ) => {
    drawDot(x, y, canvas);
    sendDot(x, y, duration);
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
