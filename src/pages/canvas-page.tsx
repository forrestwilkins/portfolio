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

  return (
    <div className="flex justify-center pt-28">
      <Canvas
        width={500}
        height={250}
        onMount={handleCanvasMount}
        onClick={handleCanvasClick}
        className="rounded-md"
      />
    </div>
  );
};

export default CanvasPage;
