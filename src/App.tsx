import { useEffect, useRef, useState } from 'react';
import './App.css';

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext>();

  useEffect(() => {
    const audioContext = new AudioContext();
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 300;

    // Connect and start
    osc.connect(audioContext.destination);
    osc.start();

    // Store context and start suspended
    audioContextRef.current = audioContext;
    audioContext.suspend();

    // Effect cleanup function to disconnect
    return () => {
      osc.disconnect(audioContext.destination);
    };
  }, []);

  const toggleOscillator = () => {
    if (!audioContextRef.current) {
      return;
    }
    if (isPlaying) {
      audioContextRef.current.suspend();
    } else {
      audioContextRef.current.resume();
    }
    setIsPlaying((prev) => !prev);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '200px',
      }}
    >
      <div
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '40px',
          padding: '10px 20px',
          color: 'white',
        }}
        onClick={toggleOscillator}
      >
        {isPlaying ? 'pause' : 'play'}
      </div>
    </div>
  );
};

export default App;
