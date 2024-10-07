import Canvas from '@/components/shared/canvas/canvas';
import { useScreenSize } from '@/hooks/shared.hooks';
import { ripplesRef } from '@/pages/ripples/ripples-ref';
import { constrain } from '@/utils/math.utils';
import { isMobileAgent } from '@/utils/shared.utils';
import { Box } from '@mui/material';
import { MouseEvent, useEffect } from 'react';

const RIPPLES_MAX_COUNT = 200;
const COLOR_CHANGE_RATE = 2;
const OPACITY_CHANGE_RATE = 0.01;
const OPACITY_MIN = 0.4;

const Ripples = () => {
  const [canvasWidth, canvasHeight] = useScreenSize();

  useEffect(() => {
    ripplesRef.current = [];
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyC') {
        ripplesRef.current = [];
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const addRipple = (x: number, y: number) => {
    if (!ripplesRef.current) {
      return;
    }
    const red = Math.random() * 255;
    const isHighRed = red >= 255;

    const green = Math.random() * 255;
    const isHighGreen = green >= 255;

    const blue = Math.random() * 255;
    const isHighBlue = blue >= 255;

    const opacity = Math.random() * 0.5 + 0.5;
    const isHighOpacity = opacity >= 1;

    // Remove the oldest ripple if the count exceeds the max
    if (ripplesRef.current.length >= RIPPLES_MAX_COUNT) {
      ripplesRef.current.shift();
    }

    ripplesRef.current.push({
      x,
      y,
      red,
      green,
      blue,
      opacity,
      isHighRed,
      isHighGreen,
      isHighBlue,
      isHighOpacity,
      radius: 0,
    });
  };

  const handleClick = (canvas: HTMLCanvasElement, e: MouseEvent<Element>) => {
    const isMobile = isMobileAgent();
    if (isMobile) {
      return;
    }
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;
    addRipple(x, y);
  };

  const handleLongPress = (x: number, y: number, duration: number) => {
    const xRounded = Math.round(x);
    const yRounded = Math.round(y);
    console.log(
      `Long press at point (${xRounded}, ${yRounded}) for ${duration}ms`,
    );
  };

  const handleRender = (canvas: HTMLCanvasElement, frameCount: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !ripplesRef.current) {
      return;
    }

    for (let i = 0; i < ripplesRef.current.length; i++) {
      const ripple = ripplesRef.current[i];

      // Remove ripples that exceed the canvas width
      if (ripple.radius / 2 >= canvasWidth) {
        ripplesRef.current.splice(i, 1);
        i--; // Decrement after removal
        continue;
      }

      if (frameCount % 4 === 0) {
        ripple.radius += 1;

        // Sync high flags for color
        if (ripple.red >= 255) {
          ripple.isHighRed = true;
        } else if (ripple.red <= 0) {
          ripple.isHighRed = false;
        }
        if (ripple.green >= 255) {
          ripple.isHighGreen = true;
        } else if (ripple.green <= 0) {
          ripple.isHighGreen = false;
        }
        if (ripple.blue >= 255) {
          ripple.isHighBlue = true;
        } else if (ripple.blue <= 0) {
          ripple.isHighBlue = false;
        }
        if (ripple.opacity >= 1) {
          ripple.isHighOpacity = true;
        } else if (ripple.opacity <= OPACITY_MIN) {
          ripple.isHighOpacity = false;
        }

        const redDelta = ripple.isHighRed
          ? ripple.red - COLOR_CHANGE_RATE
          : ripple.red + COLOR_CHANGE_RATE;
        ripple.red = constrain(redDelta, 0, 255);

        const greenDelta = ripple.isHighGreen
          ? ripple.green - COLOR_CHANGE_RATE
          : ripple.green + COLOR_CHANGE_RATE;
        ripple.green = constrain(greenDelta, 0, 255);

        const blueDelta = ripple.isHighBlue
          ? ripple.blue - COLOR_CHANGE_RATE
          : ripple.blue + COLOR_CHANGE_RATE;
        ripple.blue = constrain(blueDelta, 0, 255);

        const opacityDelta = ripple.isHighOpacity
          ? ripple.opacity - OPACITY_CHANGE_RATE
          : ripple.opacity + OPACITY_CHANGE_RATE;
        ripple.opacity = constrain(opacityDelta, OPACITY_MIN, 1);
      }

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, 2 * Math.PI);
      ctx.lineWidth = 2;

      const { red, green, blue, opacity } = ripple;
      ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
      ctx.stroke();
    }
  };

  return (
    <Box display="flex" justifyContent="center">
      <Canvas
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleClick}
        onFrameRender={handleRender}
        onLongTouchEnd={handleLongPress}
        onTouchEnd={addRipple}
        fillViewport
      />
    </Box>
  );
};

export default Ripples;
