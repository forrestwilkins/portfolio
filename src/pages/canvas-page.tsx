import Canvas from '@/components/shared/canvas';
import { useScreenSize } from '@/hooks/shared.hooks';
import { mapRange } from '@/utils/math.utils';
import { MouseEvent, TouchEvent } from 'react';

const CanvasPage = () => {
  const [screenWidth, screenHeight] = useScreenSize();

  const canvasWidth = screenWidth * 0.5;
  const canvasHeight = screenHeight * 0.6;

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
        const red = mapRange(x, 0, canvas.width, 0, 255);
        const green = mapRange(mouseY, 0, canvas.height, 0, 255);
        const blue = mapRange(mouseX, 0, canvas.width, 0, 255);

        context.strokeStyle = `rgb(${red}, ${green}, ${blue})`;
        context.beginPath();
        context.moveTo(x, y);

        context.quadraticCurveTo(
          canvasWidth / 2,
          canvasHeight / 2,
          mouseX,
          mouseY,
        );
        context.stroke();
      }
    }
  };

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

  return (
    <div className="flex justify-center lg:pt-28">
      <Canvas
        width={canvasWidth}
        height={canvasHeight}
        onMount={handleCanvasMount}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        className="rounded-md"
      />
    </div>
  );
};

export default CanvasPage;
