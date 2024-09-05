import useAppStore from '@/store/app.store';
import { getToneJS } from '@/utils/audio.utils';
import { getRandom } from '@/utils/math.utils';
import { getRandomRGB } from '@/utils/visual.utils';
import { useRef } from 'react';

const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const getAudioVisualScript = (now: number) => {
  const frameCount = 25;
  const script = [];

  for (let i = 0; i < frameCount; i++) {
    const note = NOTES[Math.floor(Math.random() * NOTES.length)];
    const duration = getRandom(4, 7);
    const octave = getRandom(1, 3);

    script.push({
      note: `${note}${octave}`,
      duration: `${duration}n`,
      color: getRandomRGB(),
    });
  }

  return script.map((item, index) => {
    return { ...item, time: now + index * 0.2 };
  });
};

const AudioVisual = () => {
  const isAudioEnabled = useAppStore((state) => state.isAudioEnabled);
  const visualRef = useRef<HTMLDivElement | null>(null);

  const handleClick = async () => {
    if (!isAudioEnabled || !visualRef.current) {
      return;
    }

    const Tone = await getToneJS();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();

    const now = Tone.now();
    const script = getAudioVisualScript(now);
    const initialBGColor = visualRef.current.style.backgroundColor;

    for (const frame of script) {
      synth.triggerAttackRelease(frame.note, frame.duration, frame.time);
    }

    for (const frame of script) {
      visualRef.current.style.backgroundColor = frame.color;

      await new Promise((resolve) =>
        setTimeout(resolve, (frame.time - Tone.now()) * 1000),
      );
    }
    visualRef.current.style.backgroundColor = initialBGColor;
  };

  return (
    <div className="flex items-center justify-center pt-32">
      <div
        ref={visualRef}
        className="h-32 w-32 cursor-pointer rounded-full bg-gray-900 transition-all hover:scale-110 hover:bg-blue-500 dark:bg-gray-100 dark:hover:bg-blue-500"
        onClick={handleClick}
      ></div>
    </div>
  );
};

export default AudioVisual;
