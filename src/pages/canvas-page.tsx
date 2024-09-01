import Canvas from '@/components/shared/canvas';
import { getRandomRGB } from '@/utils/visual.utils';

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

  const handleCanvasClick = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 8) {
        context.fillStyle = getRandomRGB();
        context.fillRect(x, y, 4, 4);
      }
    }
  };

  const handleFrameRender = (canvas: HTMLCanvasElement, frameCount: number) => {
    if (frameCount % 7 !== 0) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 8) {
        context.strokeStyle = getRandomRGB();
        context.beginPath();
        context.moveTo(x, y);
        context.quadraticCurveTo(250, 170, 230, 20);
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
        onClick={handleCanvasClick}
        onFrameRender={handleFrameRender}
        className="rounded-md"
      />
    </div>
  );
};

export default CanvasPage;
