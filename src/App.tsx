import { useState } from 'react';
import './App.css';

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const makeSound = () => {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 700;
    oscillator.connect(context.destination);
    oscillator.start();

    setTimeout(() => {
      oscillator.frequency.value = 600;
    }, 100);

    setTimeout(() => {
      oscillator.frequency.value = 500;
    }, 200);

    setTimeout(() => {
      oscillator.frequency.value = 400;
    }, 300);

    setTimeout(() => {
      oscillator.frequency.value = 300;
    }, 400);

    setTimeout(() => {
      oscillator.stop();
    }, 500);
  };

  const handleClick = () => {
    setIsPlaying(!isPlaying);
    makeSound();
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
        onClick={handleClick}
      >
        beep
      </div>
    </div>
  );
};

export default App;
