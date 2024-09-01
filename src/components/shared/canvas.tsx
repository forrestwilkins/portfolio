import { useEffect, useRef } from 'react';

interface Props {
  width?: number;
  height?: number;
  onMount?(canvas: HTMLCanvasElement): void;
  className?: string;
}

const Canvas = ({ width = 250, height = 250, onMount, className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && onMount) {
      onMount(canvasRef.current);
    }
  }, [onMount]);

  return (
    <canvas
      width={width}
      height={height}
      ref={canvasRef}
      className={className}
    />
  );
};
export default Canvas;
