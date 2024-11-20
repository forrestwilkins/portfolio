import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
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
const MAX_BUFFER_SIZE = 5;
const INIT_DEBOUNCE = 200;

interface Dot {
  x: number;
  y: number;
}

interface Stroke {
  path: Dot[];
}

const Sockets = () => {
  const token = useAppStore((state) => state.token);
  const [isCanvasMounted, setIsCanvasMounted] = useState(false);

  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const strokeBufferRef = useRef<{ x: number; y: number }[]>([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);

  const [canvasWidth, canvasHeight] = useScreenSize();
  const isDarkMode = useIsDarkMode();

  const { sendMessage } = useSubscription(SOCKETS_CHANNEL, {
    onMessage: (event) => {
      const { body }: PubSubMessage<Stroke> = JSON.parse(event.data);
      if (!canvasCtxRef.current || !body) {
        return;
      }

      let previousDot: Dot | null = null;
      for (const { x, y } of body.path) {
        const denormalizedX = Math.round(x * canvasWidth);
        const denormalizedY = Math.round(y * canvasHeight);

        if (previousDot) {
          canvasCtxRef.current.beginPath();
          canvasCtxRef.current.lineWidth = 2;
          canvasCtxRef.current.lineCap = 'round';
          canvasCtxRef.current.strokeStyle = isDarkMode ? 'white' : 'black';
          canvasCtxRef.current.moveTo(previousDot.x, previousDot.y);
          canvasCtxRef.current.lineTo(denormalizedX, denormalizedY);
          canvasCtxRef.current.stroke();
        }
        previousDot = { x: denormalizedX, y: denormalizedY };
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
    if (!token || !isCanvasMounted) {
      return;
    }

    const init = setTimeout(async () => {
      const result = await fetch('/api/interactions/sockets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: { message: Stroke }[] = await result.json();
      if (!canvasCtxRef.current) {
        return;
      }

      clearCanvas();
      for (const { message } of data) {
        let previousDot: Dot | null = null;
        for (const { x, y } of message.path) {
          const denormalizedX = Math.round(x * canvasWidth);
          const denormalizedY = Math.round(y * canvasHeight);

          if (previousDot) {
            canvasCtxRef.current.beginPath();
            canvasCtxRef.current.lineWidth = 2;
            canvasCtxRef.current.lineCap = 'round';
            canvasCtxRef.current.strokeStyle = isDarkMode ? 'white' : 'black';
            canvasCtxRef.current.moveTo(previousDot.x, previousDot.y);
            canvasCtxRef.current.lineTo(denormalizedX, denormalizedY);
            canvasCtxRef.current.stroke();
          }

          previousDot = { x: denormalizedX, y: denormalizedY };
        }
      }
    }, INIT_DEBOUNCE);

    return () => {
      clearTimeout(init);
    };
  }, [token, isCanvasMounted, canvasWidth, canvasHeight, isDarkMode]);

  const handleCanvasMount = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    canvasCtxRef.current = ctx;
    setIsCanvasMounted(true);
  }, []);

  const sendStroke = (stroke: Dot[]) => {
    if (!token) {
      return;
    }
    const normalizedStroke = stroke.map(({ x, y }) => ({
      x: x / canvasWidth,
      y: y / canvasHeight,
    }));
    const message: PubSubMessage<Stroke> = {
      request: 'PUBLISH',
      channel: SOCKETS_CHANNEL,
      body: { path: normalizedStroke },
      token,
    };
    sendMessage(JSON.stringify(message));
  };

  const setMousePosition = (x: number, y: number) => {
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
    setMousePosition(x, y); // update position
    canvasCtx.lineTo(mousePositionRef.current.x, mousePositionRef.current.y); // to
    canvasCtx.stroke();

    // Add stroke to buffer and send if buffer is full
    strokeBufferRef.current.push({ x, y });
    if (strokeBufferRef.current.length > MAX_BUFFER_SIZE) {
      sendStroke(strokeBufferRef.current);
      strokeBufferRef.current = [];
    }
  };

  const handleTouchMove = (x: number, y: number) => {
    if (!canvasCtxRef.current) {
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
    setMousePosition(x, y); // update position
    canvasCtx.lineTo(mousePositionRef.current.x, mousePositionRef.current.y); // to
    canvasCtx.stroke();

    // Add stroke to buffer and send if buffer is full
    strokeBufferRef.current.push({ x, y });
    if (strokeBufferRef.current.length > MAX_BUFFER_SIZE) {
      sendStroke(strokeBufferRef.current);
      strokeBufferRef.current = [];
    }
  };

  const handleMouseDown = (
    _canvas: HTMLCanvasElement,
    e: MouseEvent<Element>,
  ) => {
    setMousePosition(e.clientX, e.clientY);
    isMouseDownRef.current = true;
  };

  return (
    <Canvas
      width={canvasWidth}
      height={canvasHeight}
      onMount={handleCanvasMount}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={setMousePosition}
      onMouseUp={() => {
        isMouseDownRef.current = false;
      }}
      fillViewport
    />
  );
};

export default Sockets;
