import { useEffect, useRef, useState } from 'react';
import { convertFrequencyToColor, generateMelody } from '../utils';

const HelloSound = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [textColor, setTextColor] = useState('white');

  const audioContextRef = useRef<AudioContext>();
  const oscillatorRef = useRef<OscillatorNode>();

  useEffect(() => {
    return () => {
      if (oscillatorRef.current && audioContextRef.current) {
        oscillatorRef.current.disconnect(audioContextRef.current.destination);
      }
    };
  }, []);

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
    <div className="bg-black fixed top-0 left-0 w-full h-full flex justify-center">
      <div
        className="cursor-pointer no-underline text-4xl mt-44 pt-2.5 px-5 pb-3.5 transition-all h-fit rounded-lg"
        style={{
          color: isPlaying ? textColor : 'white',
          border: `2px solid ${isPlaying ? textColor : 'white'}`,
        }}
        onClick={handleClick}
      >
        {getBtnText()}
      </div>
    </div>
  );
};

export default HelloSound;
