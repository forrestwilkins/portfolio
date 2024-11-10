import { useCallback, useEffect } from 'react';
import Canvas from '../components/shared/canvas/canvas';
import {
  PubSubMessage,
  useIsDarkMode,
  useScreenSize,
  useSubscription,
} from '../hooks/shared.hooks';
import useAppStore from '../store/app.store';
import { isMobileAgent } from '../utils/shared.utils';

const SOCKETS_CHANNEL = 'sockets';

interface Dot {
  x: number;
  y: number;
  duration: number;
}

const Sockets = () => {
  const token = useAppStore((state) => state.token);

  const [canvasWidth, canvasHeight] = useScreenSize();
  const isDarkMode = useIsDarkMode();

  const { sendMessage } = useSubscription(SOCKETS_CHANNEL, {
    onMessage: (event) => {
      const { body }: PubSubMessage<Dot> = JSON.parse(event.data);
      const canvas = document.querySelector('canvas');
      if (canvas && body) {
        drawDot(body.x, body.y, canvas);
      }
    },
  });

  const drawDot = useCallback(
    (x: number, y: number, canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.fillStyle = isDarkMode ? 'white' : 'black';
      ctx.fillRect(x, y, 1, 1);
    },
    [isDarkMode],
  );

  useEffect(() => {
    if (!token) {
      return;
    }
    const init = async () => {
      const result = await fetch('/api/interactions/sockets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: { message: Dot }[] = await result.json();
      const canvas = document.querySelector('canvas');

      for (const { message } of data) {
        if (canvas) {
          drawDot(message.x, message.y, canvas);
        }
      }
    };
    init();
  }, [token, drawDot]);

  const sendDot = (x: number, y: number, duration: number) => {
    const message = {
      request: 'PUBLISH',
      channel: SOCKETS_CHANNEL,
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

  return (
    <Canvas
      width={canvasWidth}
      height={canvasHeight}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      fillViewport
    />
  );
};

export default Sockets;
