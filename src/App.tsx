import './App.css';

const App = () => {
  const makeSound = () => {
    var context = new AudioContext();
    var oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 800;
    oscillator.connect(context.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), 100);
  };

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', paddingTop: '200px' }}
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
