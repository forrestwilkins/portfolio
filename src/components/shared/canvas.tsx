import {
  CSSProperties,
  MouseEvent,
  TouchEvent,
  useEffect,
  useRef,
} from 'react';

interface Props {
  width?: number;
  height?: number;
  onMount?(canvas: HTMLCanvasElement): void;
  onClick?(canvas: HTMLCanvasElement, e: MouseEvent<Element>): void;
  onMouseMove?(canvas: HTMLCanvasElement, e: MouseEvent<Element>): void;
  onTouchMove?(canvas: HTMLCanvasElement, e: TouchEvent<Element>): void;
  onFrameRender?(canvas: HTMLCanvasElement, frameCount: number): void;
  style?: CSSProperties;
}

const Canvas = ({
  width = 250,
  height = 250,
  onClick,
  onFrameRender,
  onTouchMove,
  onMouseMove,
  onMount,
  style,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && onMount) {
      onMount(canvasRef.current);
    }
  }, [onMount]);

  useEffect(() => {
    let frameCount = 1;
    let animationFrameId: number;

    if (canvasRef.current && onFrameRender) {
      const canvas = canvasRef.current;
      const render = () => {
        onFrameRender(canvas, frameCount);
        animationFrameId = window.requestAnimationFrame(render);
        frameCount++;
      };
      render();
    }
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [onFrameRender]);

  const handleClick = (e: MouseEvent<Element>) => {
    if (canvasRef.current && onClick) {
      onClick(canvasRef.current, e);
    }
  };

  const handleMouseMove = (e: MouseEvent<Element>) => {
    if (canvasRef.current && onMouseMove) {
      onMouseMove(canvasRef.current, e);
    }
  };

  const handleTouchMove = (e: TouchEvent<Element>) => {
    if (canvasRef.current && onTouchMove) {
      onTouchMove(canvasRef.current, e);
    }
  };

  return (
    <canvas
      width={width}
      height={height}
      style={style}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      ref={canvasRef}
    />
  );
};
export default Canvas;
