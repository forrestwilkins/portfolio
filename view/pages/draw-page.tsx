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

const DRAW_CHANNEL = 'draw';
const DRAW_CLEAR_CHANNEL = 'draw:clear';
const MAX_BUFFER_SIZE = 5;
const INIT_DEBOUNCE = 200;

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  path: Point[];
}

const DrawPage = () => {
  const token = useAppStore((state) => state.token);
  const [isCanvasMounted, setIsCanvasMounted] = useState(false);

  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const strokeBufferRef = useRef<{ x: number; y: number }[]>([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);

  const [canvasWidth, canvasHeight] = useScreenSize();
  const isDarkMode = useIsDarkMode();

  const drawMessagePath = useCallback(
    (path: Point[]) => {
      if (!canvasCtxRef.current) {
        return;
      }

      const { current: ctx } = canvasCtxRef;
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = isDarkMode ? 'white' : 'black';

      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        const denormalizedX = Math.round(point.x * canvasWidth);
        const denormalizedY = Math.round(point.y * canvasHeight);

        if (i === 0) {
          ctx.moveTo(denormalizedX, denormalizedY);
        } else {
          ctx.lineTo(denormalizedX, denormalizedY);
        }
      }
      ctx.stroke();
    },
    [canvasWidth, canvasHeight, isDarkMode],
  );

  const { sendMessage } = useSubscription(DRAW_CHANNEL, {
    onMessage: (event) => {
      const { body }: PubSubMessage<Stroke> = JSON.parse(event.data);
      if (!body) {
        return;
      }
      drawMessagePath(body.path);
    },
  });

  useSubscription(DRAW_CLEAR_CHANNEL, {
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
      const result = await fetch('/api/interactions/draw', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: { message: Stroke }[] = await result.json();
      if (!canvasCtxRef.current) {
        return;
      }

      clearCanvas();
      for (const { message } of data) {
        drawMessagePath(message.path);
      }
    }, INIT_DEBOUNCE);

    return () => {
      clearTimeout(init);
    };
  }, [token, isCanvasMounted, drawMessagePath]);

  const handleCanvasMount = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    canvasCtxRef.current = ctx;
    setIsCanvasMounted(true);
  }, []);

  const sendStroke = () => {
    if (!token) {
      return;
    }
    const { current } = strokeBufferRef;
    const normalizedStroke = current.map(({ x, y }) => ({
      x: x / canvasWidth,
      y: y / canvasHeight,
    }));
    const message: PubSubMessage<Stroke> = {
      request: 'PUBLISH',
      channel: DRAW_CHANNEL,
      body: { path: normalizedStroke },
      token,
    };
    sendMessage(JSON.stringify(message));

    // Clear buffer after sending
    strokeBufferRef.current = [];
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
      sendStroke();
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
      sendStroke();
    }
  };

  const handleMouseDown = (
    _canvas: HTMLCanvasElement,
    e: MouseEvent<Element>,
  ) => {
    isMouseDownRef.current = true;
    setMousePosition(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    sendStroke();
  };

  return (
    <Canvas
      width={canvasWidth}
      height={canvasHeight}
      onMount={handleCanvasMount}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchStart={setMousePosition}
      onTouchEnd={() => sendStroke()}
      fillViewport
    />
  );
};

export default DrawPage;
