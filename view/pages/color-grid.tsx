import { Box } from '@mui/material';
import Canvas from '../components/shared/canvas/canvas';
import { useScreenSize } from '../hooks/shared.hooks';
import { constrain, mapRange } from '../utils/math.utils';

const ColorGrid = () => {
  const [screenWidth, screenHeight] = useScreenSize();

  const canvasWidth = constrain(screenWidth * 0.8, 0, 600);
  const canvasHeight = constrain(screenHeight * 0.65, 0, 500);

  const handleMouseMove = (x: number, y: number, canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

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
    <Box display="flex" justifyContent="center">
      <Canvas
        width={canvasWidth}
        height={canvasHeight}
        onMount={handleCanvasMount}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        sx={{ borderRadius: '8px' }}
        disableFullScreen
      />
    </Box>
  );
};

export default ColorGrid;
