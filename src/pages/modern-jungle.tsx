import useAppStore from '@/store/app.store';
import { getToneJS } from '@/utils/audio.utils';
import { useEffect, useRef, useState } from 'react';
import { type TransportClass } from 'tone/build/esm/core/clock/Transport';

const ModernJungle = () => {
  const transportRef = useRef<TransportClass | null>(null);

  const isAudioEnabled = useAppStore((state) => state.isAudioEnabled);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isAudioEnabled) {
      return;
    }
    const init = async () => {
      const Tone = await getToneJS();
      const transport = Tone.getTransport();
      transportRef.current = transport;

      // Load the Amen Break sample
      const amenBreak = new Tone.Player(
        '/audio/amen-break.wav',
      ).toDestination();

      // Set BPM
      transport.bpm.value = 165;

      // Define breakbeat slices
      const slices = {
        kick: [0, 0.2],
        snare: [0.3, 0.5],
        hat: [0.6, 0.7],
      };

      // Function to play breakbeat slice
      function playSlice(start: number, end: number, time: number) {
        amenBreak.start(time, start, end - start);
      }

      // Schedule breakbeat loop
      transport.scheduleRepeat((time) => {
        playSlice(slices.kick[0], slices.kick[1], time);
        playSlice(slices.snare[0], slices.snare[1], time + 0.25);
        playSlice(slices.hat[0], slices.hat[1], time + 0.5);
      }, '1m');

      // Create bassline synth
      const bass = new Tone.Synth({
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 0.1,
          decay: 0.3,
          sustain: 0.5,
          release: 0.8,
        },
      }).toDestination();

      const bassline = ['C1', 'E1', 'D1', 'G1'];

      // Schedule bassline loop
      transport.scheduleRepeat((time) => {
        const note = bassline[Math.floor(Math.random() * bassline.length)];
        bass.triggerAttackRelease(note, '8n', time);
      }, '1m');

      // Create atmospheric pad synth
      const pad = new Tone.PolySynth(Tone.Synth).toDestination();
      pad.set({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 2, release: 4 },
      });

      // Schedule atmospheric pad
      transport.scheduleOnce((time) => {
        pad.triggerAttackRelease(['C4', 'E4', 'G4'], '4m', time);
      }, '0');

      // Add effects
      const reverb = new Tone.Reverb({ decay: 2 }).toDestination();
      const filter = new Tone.Filter(800, 'lowpass').toDestination();

      amenBreak.connect(reverb);
      bass.connect(filter);
    };
    init();

    // Cleanup on component unmount
    return () => {
      if (!transportRef.current) {
        return;
      }
      transportRef.current.cancel();
      transportRef.current.stop();
    };
  }, [isAudioEnabled]);

  const handlePlay = async () => {
    if (!transportRef.current) {
      return;
    }
    const Tone = await getToneJS();

    if (!isPlaying) {
      await Tone.start();
      transportRef.current.start();
      setIsPlaying(true);
    } else {
      transportRef.current.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Jungle Track</h1>
      <button
        onClick={handlePlay}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        {isPlaying ? 'Stop' : 'Play'}
      </button>
    </div>
  );
};

export default ModernJungle;
