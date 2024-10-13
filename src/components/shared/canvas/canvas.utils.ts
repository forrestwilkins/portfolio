import { canvasRef } from '@/components/shared/canvas/canvas.refs';

export const clearCanvas = () => {
  if (!canvasRef.current) {
    return;
  }
  const ctx = canvasRef.current.getContext('2d');
  if (ctx) {
    const { width, height } = canvasRef.current;
    ctx.clearRect(0, 0, width, height);
  }
};
