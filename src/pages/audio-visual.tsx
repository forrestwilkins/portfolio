import useAppStore from '@/store/app.store';
import { getToneJS } from '@/utils/shared.utils';
import { useRef } from 'react';

const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const getAudioVisualScript = (now: number) => {
  const frameCount = 5;
  const script = [];

  for (let i = 0; i < frameCount; i++) {
    const note = NOTES[Math.floor(Math.random() * NOTES.length)];
    const octave = Math.floor(Math.random() * 5) + 2;

    script.push({
      note: `${note}${octave}`,
    });
  }

  return script.map((item, index) => {
    return { ...item, time: now + index * 0.5 };
  });
};

const AudioVisual = () => {
  const isAudioEnabled = useAppStore((state) => state.isAudioEnabled);
  const visualRef = useRef<HTMLDivElement | null>(null);

  const handleClick = async () => {
    if (!isAudioEnabled) {
      return;
    }

    const Tone = await getToneJS();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();

    const now = Tone.now();
    const script = getAudioVisualScript(now);

    for (const frame of script) {
      synth.triggerAttack(frame.note, frame.time);
    }
    synth.triggerRelease(
      script.map((f) => f.note),
      now + script.length * 0.5,
    );
  };

  return (
    <div className="flex items-center justify-center pt-32">
      <div
        ref={visualRef}
        className="h-32 w-32 cursor-pointer rounded-full bg-gray-900 transition-all duration-700 hover:scale-110 hover:bg-blue-500 dark:bg-gray-100 dark:hover:bg-blue-500"
        onClick={handleClick}
      ></div>
    </div>
  );
};

export default AudioVisual;
