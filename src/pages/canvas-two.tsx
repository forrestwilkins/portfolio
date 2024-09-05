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
  opacity: number;
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
    const opacity = Math.random() * 0.5 + 0.5;

    ripplesRef.current.push({
      x,
      y,
      red,
      green,
      blue,
      opacity,
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
      ctx.lineWidth = 2;
      ctx.strokeStyle = `
        rgba(
          ${ripple.red},
          ${ripple.green},
          ${ripple.blue},
          ${ripple.opacity}
        )`;
      ctx.stroke();

      if (frameCount % 4 === 0) {
        ripple.radius += 1;

        const redDelta = ripple.red + (Math.random() * 10 - 5);
        ripple.red = constrain(redDelta, 0, 255);

        const greenDelta = ripple.green + (Math.random() * 10 - 5);
        ripple.green = constrain(greenDelta, 0, 255);

        const blueDelta = ripple.blue + (Math.random() * 10 - 5);
        ripple.blue = constrain(blueDelta, 0, 255);

        const opacityDelta = ripple.opacity + (Math.random() * 0.1 - 0.05);
        ripple.opacity = constrain(opacityDelta, 0.1, 1);
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
