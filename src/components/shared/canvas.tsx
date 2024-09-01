import { useEffect, useRef } from 'react';

interface Props {
  width?: number;
  height?: number;
  className?: string;
  onClick?(canvas: HTMLCanvasElement): void;
  onMount?(canvas: HTMLCanvasElement): void;
}

const Canvas = ({
  width = 250,
  height = 250,
  className,
  onClick,
  onMount,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && onMount) {
      onMount(canvasRef.current);
    }
  }, [onMount]);

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
