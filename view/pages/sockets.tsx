import { MouseEvent, useCallback, useEffect, useRef } from 'react';
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

const SOCKETS_CHANNEL = 'sockets';
const SOCKETS_CLEAR_CHANNEL = 'sockets:clear';
const INIT_DEBOUNCE = 200;

interface Dot {
  x: number;
  y: number;
}

const Sockets = () => {
  const token = useAppStore((state) => state.token);

  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);

  const [canvasWidth, canvasHeight] = useScreenSize();
  const isDarkMode = useIsDarkMode();

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
    }, INIT_DEBOUNCE);

    return () => {
      clearTimeout(init);
    };
  }, [token, drawDot, canvasWidth, canvasHeight]);

  const sendDot = (x: number, y: number) => {
    if (!token) {
      return;
    }

    const normalizedX = x / canvasWidth;
    const normalizedY = y / canvasHeight;
    const body = { x: normalizedX, y: normalizedY };

    const message: PubSubMessage<Dot> = {
      request: 'PUBLISH',
      channel: SOCKETS_CHANNEL,
      token,
      body,
    };
    sendMessage(JSON.stringify(message));
  };

  const setPosition = (x: number, y: number) => {
    mousePositionRef.current = { x, y };
  };

  const handleMouseMove = (x: number, y: number) => {
    const isMobile = isMobileAgent();
    if (isMobile || !isMouseDownRef.current || !canvasCtxRef.current) {
      return;
    }

    // Set up path
    const { current: canvasCtx } = canvasCtxRef;

    canvasCtx.beginPath();
    canvasCtx.lineWidth = 2;
    canvasCtx.lineCap = 'round';
    canvasCtx.strokeStyle = isDarkMode ? 'white' : 'black';

    // Draw line
    canvasCtx.moveTo(mousePositionRef.current.x, mousePositionRef.current.y); // from
    setPosition(x, y); // update position
    canvasCtx.lineTo(mousePositionRef.current.x, mousePositionRef.current.y); // to
    canvasCtx.stroke();

    sendDot(x, y);
  };

  const handleTouchMove = (x: number, y: number, canvas: HTMLCanvasElement) => {
    drawDot(x, y, canvas);
    sendDot(x, y);
  };

  const handleMouseDown = (
    _canvas: HTMLCanvasElement,
    e: MouseEvent<Element>,
  ) => {
    isMouseDownRef.current = true;
    setPosition(e.clientX, e.clientY);
  };

  const handleMount = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    canvasCtxRef.current = ctx;
  };

  return (
    <Canvas
      width={canvasWidth}
      height={canvasHeight}
      onMount={handleMount}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={() => {
        isMouseDownRef.current = false;
      }}
      fillViewport
    />
  );
};

export default Sockets;
