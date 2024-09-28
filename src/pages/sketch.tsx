import Canvas from '@/components/shared/canvas';
import { useScreenSize } from '@/hooks/shared.hooks';
import { constrain } from '@/utils/math.utils';
import { Box } from '@mui/material';
import { MouseEvent } from 'react';

const Sketch = () => {
  const [screenWidth, screenHeight] = useScreenSize();

  const canvasWidth = constrain(screenWidth * 0.9, 0, 700);
  const canvasHeight = constrain(screenHeight * 0.95, 0, 500);

  const handleClick = (canvas: HTMLCanvasElement, e: MouseEvent<Element>) => {
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;

    console.log('Clicked at', x, y);
  };

  const handleRender = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // TODO: Draw something
  };

  return (
    <Box display="flex" justifyContent="center">
      <Canvas
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleClick}
        onFrameRender={handleRender}
        sx={{ borderRadius: 4, border: '1px solid rgb(0, 255, 160)' }}
      />
    </Box>
  );
};

export default Sketch;
