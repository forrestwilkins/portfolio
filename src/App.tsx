import './App.css';

const App = () => (
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
      onClick={() => {
        const context = new AudioContext();
        const oscillator = context.createOscillator();

        oscillator.type = 'sine';
        oscillator.frequency.value = 500;
        oscillator.connect(context.destination);
        oscillator.start();

        setTimeout(() => {
          oscillator.frequency.value = 400;
        }, 100);

        setTimeout(() => {
          oscillator.frequency.value = 300;
        }, 200);

        setTimeout(() => {
          oscillator.frequency.value = 200;
        }, 300);

        setTimeout(() => {
          oscillator.frequency.value = 50;
        }, 400);

        setTimeout(() => {
          oscillator.stop();
        }, 500);
      }}
    >
      beep
    </div>
  </div>
);

export default App;
