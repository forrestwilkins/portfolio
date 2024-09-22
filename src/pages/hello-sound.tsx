import { useIsLightMode } from '@/hooks/shared.hooks';
import { Box, Button, SxProps } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { convertFrequencyToColor, generateMelody } from '../utils/audio.utils';

const HelloSound = () => {
  const isLightMode = useIsLightMode();
  const baseColor = isLightMode ? 'black' : 'white';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [textColor, setTextColor] = useState(baseColor);

  const audioContextRef = useRef<AudioContext>();
  const oscillatorRef = useRef<OscillatorNode>();

  const btnStyles: SxProps = {
    border: `4px solid ${isPlaying ? textColor : baseColor}`,
    borderRadius: '20px',
    color: isPlaying ? textColor : baseColor,
    fontSize: '36px',
    height: 'fit-content',
    marginTop: '176px',
    px: '20px',
    paddingBottom: '8px',
    textDecoration: 'none',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

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
    <Box display="flex" justifyContent="center">
      <Button sx={btnStyles} onClick={handleClick}>
        {getBtnText()}
      </Button>
    </Box>
  );
};

export default HelloSound;
