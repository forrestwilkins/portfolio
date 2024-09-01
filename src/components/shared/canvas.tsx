import { useEffect, useRef } from 'react';

interface Props {
  width?: number;
  height?: number;
  className?: string;
  onClick?(canvas: HTMLCanvasElement): void;
  onMount?(canvas: HTMLCanvasElement): void;
  onFrameRender?(canvas: HTMLCanvasElement, frameCount: number): void;
}

const Canvas = ({
  width = 250,
  height = 250,
  className,
  onClick,
  onFrameRender,
  onMount,
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

  const handleClick = () => {
    if (canvasRef.current && onClick) {
      onClick(canvasRef.current);
    }
  };

  return (
    <canvas
      width={width}
      height={height}
      className={className}
      onClick={handleClick}
      ref={canvasRef}
    />
  );
};
export default Canvas;
