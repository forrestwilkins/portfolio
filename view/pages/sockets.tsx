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
import { clearCanvas } from '../components/shared/canvas/canvas.utils';

const SOCKETS_CHANNEL = 'sockets';
const SOCKETS_CLEAR_CHANNEL = 'sockets:clear';

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
        const denormalizedX = Math.round(body.x * canvasWidth);
        const denormalizedY = Math.round(body.y * canvasHeight);
        drawDot(denormalizedX, denormalizedY, canvas);
      }
    },
  });

  useSubscription(SOCKETS_CLEAR_CHANNEL, {
    onMessage: (event) => {
      const { body }: PubSubMessage<{ clear: boolean }> = JSON.parse(
        event.data,
      );
      if (body?.clear) {
        clearCanvas();
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
    const init = setTimeout(async () => {
      const result = await fetch('/api/interactions/sockets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: { message: Dot }[] = await result.json();
      const canvas = document.querySelector('canvas');

      clearCanvas();
      for (const { message } of data) {
        if (canvas) {
          const denormalizedX = Math.round(message.x * canvasWidth);
          const denormalizedY = Math.round(message.y * canvasHeight);
          drawDot(denormalizedX, denormalizedY, canvas);
        }
      }
    }, 200);

    return () => {
      clearTimeout(init);
    };
  }, [token, drawDot, canvasWidth, canvasHeight]);

  const sendDot = (x: number, y: number, duration: number) => {
    if (!token) {
      return;
    }

    const normalizedX = x / canvasWidth;
    const normalizedY = y / canvasHeight;

    const body = {
      x: normalizedX,
      y: normalizedY,
      duration,
      canvasWidth,
      canvasHeight,
    };

    const message: PubSubMessage<Dot> = {
      request: 'PUBLISH',
      channel: SOCKETS_CHANNEL,
      token,
      body,
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
