import Canvas from '@/components/shared/canvas';
import { useScreenSize } from '@/hooks/shared.hooks';
import { constrain } from '@/utils/math.utils';
import { MouseEvent, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  red: number;
  green: number;
  blue: number;
  radius: number;
}

const CanvasTwo = () => {
  const ripplesRef = useRef<Ripple[]>([]);

  const [screenWidth, screenHeight] = useScreenSize();

  const canvasWidth = constrain(screenWidth * 0.8, 0, 600);
  const canvasHeight = constrain(screenHeight * 0.65, 0, 500);

  const handleClick = (canvas: HTMLCanvasElement, e: MouseEvent<Element>) => {
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;
    const red = Math.random() * 255;
    const green = Math.random() * 255;
    const blue = Math.random() * 255;

    ripplesRef.current.push({
      x,
      y,
      red,
      green,
      blue,
      radius: 0,
    });
  };

  const handleRender = (canvas: HTMLCanvasElement, frameCount: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    for (let i = 0; i < ripplesRef.current.length; i++) {
      const ripple = ripplesRef.current[i];
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgb(${ripple.red}, ${ripple.green}, ${ripple.blue})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (frameCount % 4 === 0) {
        ripple.radius += 1;

        ripple.red += Math.random() * 10 - 5;
        ripple.green += Math.random() * 10 - 5;
        ripple.blue += Math.random() * 10 - 5;
      }
    }
  };

  return (
    <div className="flex justify-center lg:pt-5">
      <Canvas
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleClick}
        onFrameRender={handleRender}
        className="rounded-md"
      />
    </div>
  );
};

export default CanvasTwo;
