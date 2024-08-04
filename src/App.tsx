import { useEffect, useRef, useState } from 'react';

const STARTING_FREQUENCY = 360;

const App = () => {
  const [frequency, setFrequency] = useState(STARTING_FREQUENCY);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const audioContextRef = useRef<AudioContext>();
  const oscillatorRef = useRef<OscillatorNode>();

  const bgGray = Math.min(frequency / 3.5, 100);

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
    oscillator.frequency.value = STARTING_FREQUENCY;

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
    if (!audioContextRef.current || !oscillatorRef.current) {
      return;
    }
    if (isPlaying) {
      audioContextRef.current.suspend();
    } else {
      audioContextRef.current.resume();

      oscillatorRef.current.frequency.value -= 20;
      setFrequency(oscillatorRef.current.frequency.value);
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

  const getOverlayBgColor = () => {
    if (!isEnabled) {
      return 'black';
    }
    return `rgb(${bgGray}, ${bgGray}, ${bgGray})`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        backgroundColor: getOverlayBgColor(),
        transition: 'background-color 0.5s',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '40px',
          padding: '10px 20px',
          color: 'white',
          marginTop: '150px',
        }}
        onClick={handleClick}
      >
        {getBtnText()}
      </div>
    </div>
  );
};

export default App;
