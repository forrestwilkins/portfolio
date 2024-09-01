import Canvas from '@/components/shared/canvas';
import { getRandomRGB } from '@/utils/visual.utils';
import { MouseEvent } from 'react';

const CanvasPage = () => {
  const handleCanvasMount = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 8) {
        context.fillStyle = `rgb(${x}, ${y}, 100)`;
        context.fillRect(x, y, 4, 4);
      }
    }
  };

  const handleCanvasClick = (
    canvas: HTMLCanvasElement,
    e: MouseEvent<Element>,
  ) => {
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 8) {
        context.strokeStyle = getRandomRGB();
        context.beginPath();
        context.moveTo(x, y);

        context.quadraticCurveTo(250, 125, mouseX, mouseY);
        context.stroke();
      }
    }
  };

  return (
    <div className="flex justify-center pt-28">
      <Canvas
        width={500}
        height={250}
        onMount={handleCanvasMount}
        onMouseMove={handleCanvasClick}
        className="rounded-md"
      />
    </div>
  );
};

export default CanvasPage;
