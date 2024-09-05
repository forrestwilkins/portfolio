import Canvas from '@/components/shared/canvas';
import { useScreenSize } from '@/hooks/shared.hooks';
import { constrain } from '@/utils/math.utils';

const CanvasTwo = () => {
  const [screenWidth, screenHeight] = useScreenSize();

  const canvasWidth = constrain(screenWidth * 0.8, 0, 600);
  const canvasHeight = constrain(screenHeight * 0.65, 0, 500);

  return (
    <div className="flex justify-center lg:pt-5">
      <Canvas
        width={canvasWidth}
        height={canvasHeight}
        className="rounded-md"
      />
    </div>
  );
};

export default CanvasTwo;
