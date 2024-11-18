import { useCallback, useEffect, useRef, useState } from 'react';
import Canvas from '../components/shared/canvas/canvas';
import { clearCanvas } from '../components/shared/canvas/canvas.utils';
import {
  PubSubMessage,
  useIsDarkMode,
  useScreenSize,
  useSubscription,
} from '../hooks/shared.hooks';
import useAppStore from '../store/app.store';
import { isMobileAgent } from '../utils/shared.utils';
import { getRandomRGB } from '../utils/visual.utils';

const SOCKETS_CHANNEL = 'sockets';
const SOCKETS_CLEAR_CHANNEL = 'sockets:clear';

interface Dot {
  x: number;
  y: number;
  color: string;
}

const Sockets = () => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const token = useAppStore((state) => state.token);

  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  const [canvasWidth, canvasHeight] = useScreenSize();
  const isDarkMode = useIsDarkMode();

  const { sendMessage } = useSubscription(SOCKETS_CHANNEL, {
    onMessage: (event) => {
      const { body }: PubSubMessage<Dot> = JSON.parse(event.data);
      const canvas = document.querySelector('canvas');
      if (canvas && body) {
        const denormalizedX = Math.round(body.x * canvasWidth);
        const denormalizedY = Math.round(body.y * canvasHeight);
        drawDot(denormalizedX, denormalizedY, body.color, canvas);
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
    (x: number, y: number, color: string, canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.fillStyle = color;
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
          drawDot(denormalizedX, denormalizedY, message.color, canvas);
        }
      }
    }, 200);

    return () => {
      clearTimeout(init);
    };
  }, [token, drawDot, canvasWidth, canvasHeight]);

  const sendDot = (x: number, y: number, color: string) => {
    if (!token) {
      return;
    }

    const normalizedX = x / canvasWidth;
    const normalizedY = y / canvasHeight;

    const body = {
      x: normalizedX,
      y: normalizedY,
      color,
    };

    const message: PubSubMessage<Dot> = {
      request: 'PUBLISH',
      channel: SOCKETS_CHANNEL,
      token,
      body,
    };
    sendMessage(JSON.stringify(message));
  };

  const setPosition = (x: number, y: number) => {
    positionRef.current = { x, y };
  };

  const handleMouseMove = (x: number, y: number) => {
    const isMobile = isMobileAgent();

    if (isMobile || !isMouseDown || !canvasCtxRef.current) {
      return;
    }
    const color = getRandomRGB();

    // Set up path
    const { current: canvasCtx } = canvasCtxRef;
    canvasCtx.beginPath();
    canvasCtx.lineWidth = 2;
    canvasCtx.lineCap = 'round';
    canvasCtx.strokeStyle = color;

    // Draw line
    canvasCtx.moveTo(positionRef.current.x, positionRef.current.y); // from
    setPosition(x, y); // update position
    canvasCtx.lineTo(positionRef.current.x, positionRef.current.y); // to
    canvasCtx.stroke();
  };

  const handleTouchMove = (x: number, y: number, canvas: HTMLCanvasElement) => {
    const color = getRandomRGB();
    drawDot(x, y, color, canvas);
    sendDot(x, y, color);
  };

  return (
    <Canvas
      width={canvasWidth}
      height={canvasHeight}
      onTouchMove={handleTouchMove}
      onMouseMove={handleMouseMove}
      onMount={(canvas) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return;
        }
        canvasCtxRef.current = ctx;
      }}
      onMouseDown={(_canvas, e) => {
        setIsMouseDown(true);
        setPosition(e.clientX, e.clientY);
      }}
      onMouseUp={() => setIsMouseDown(false)}
      fillViewport
    />
  );
};

export default Sockets;
