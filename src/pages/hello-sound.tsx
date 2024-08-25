import { useTheme } from '@/components/app/theme-provider';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { convertFrequencyToColor, generateMelody } from '../utils/sound.utils';

const HelloSound = () => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const baseColor = isLightMode ? 'black' : 'white';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [textColor, setTextColor] = useState(baseColor);

  const audioContextRef = useRef<AudioContext>();
  const oscillatorRef = useRef<OscillatorNode>();

  useEffect(() => {
    return () => {
      if (oscillatorRef.current && audioContextRef.current && isEnabled) {
        oscillatorRef.current.disconnect(audioContextRef.current.destination);
      }
    };
  }, [isEnabled]);

  const init = () => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();

    oscillator.type = 'sine';

    // Connect and start
    oscillator.connect(audioContext.destination);
    oscillator.start();

    // Store oscillator
    oscillatorRef.current = oscillator;

    // Store context and start suspended
    audioContextRef.current = audioContext;
    audioContext.suspend();

    setIsEnabled(true);
  };

  const handleClick = () => {
    if (!isEnabled) {
      init();
      return;
    }
    if (!audioContextRef.current) {
      return;
    }
    if (isPlaying) {
      audioContextRef.current.suspend();
    } else {
      audioContextRef.current.resume();

      const { melody, durations } = generateMelody(100);

      let i = 0;
      const interval = setInterval(() => {
        if (!audioContextRef.current || !oscillatorRef.current) {
          return;
        }
        if (i >= melody.length) {
          setIsPlaying(false);
          audioContextRef.current.suspend();
          clearInterval(interval);
          return;
        }

        const frequency = melody[i];
        const color = convertFrequencyToColor(frequency);
        oscillatorRef.current.frequency.value = frequency;
        setTextColor(color);

        i++;
      }, durations[i] * 1000);
    }
    setIsPlaying((prev) => !prev);
  };

  const getBtnText = () => {
    if (!isEnabled) {
      return 'enable';
    }
    if (isPlaying) {
      return 'pause';
    }
    return 'play';
  };

  return (
    <div className="flex justify-center">
      <Button
        className="mt-44 h-fit rounded-lg bg-transparent px-5 pb-3.5 pt-2.5 text-4xl no-underline transition-all hover:bg-transparent"
        variant="secondary"
        style={{
          color: isPlaying ? textColor : baseColor,
          border: `4px solid ${isPlaying ? textColor : baseColor}`,
        }}
        onClick={handleClick}
      >
        {getBtnText()}
      </Button>
    </div>
  );
};

export default HelloSound;
