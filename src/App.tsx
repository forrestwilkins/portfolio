import './App.css';

const App = () => {
  const makeSound = () => {
    const context = new AudioContext();
    const oscillator = context.createOscillator();

    oscillator.type = 'sine';
    oscillator.frequency.value = 400;
    oscillator.connect(context.destination);
    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
    }, 100);
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
        onClick={makeSound}
      >
        beep
      </div>
    </div>
  );
};

export default App;
