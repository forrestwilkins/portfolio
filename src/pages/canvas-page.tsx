import Canvas from '@/components/shared/canvas';
import { getRandomRGB } from '@/utils/visual.utils';
import { MouseEvent, TouchEvent } from 'react';

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

  const getMousePosition = (
    canvas: HTMLCanvasElement,
    e: MouseEvent<Element> | TouchEvent<Element>,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleMouseMove = (
    canvas: HTMLCanvasElement,
    e: TouchEvent<Element> | MouseEvent<Element>,
  ) => {
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const { x: mouseX, y: mouseY } = getMousePosition(canvas, e);

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
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        className="rounded-md"
      />
    </div>
  );
};

export default CanvasPage;
