import useAppStore from '@/store/app.store';
import { getToneJS } from '@/utils/shared.utils';
import { useRef } from 'react';

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

    synth.triggerAttack('D4', now);
    synth.triggerAttack('F4', now + 0.5);
    synth.triggerAttack('A4', now + 1);
    synth.triggerAttack('C5', now + 1.5);
    synth.triggerAttack('E5', now + 2);

    synth.triggerRelease(['D4', 'F4', 'A4', 'C5', 'E5'], now + 4);
  };

  return (
    <div className="flex items-center justify-center pt-32">
      <div
        ref={visualRef}
        className="h-32 w-32 bg-blue-500"
        onClick={handleClick}
      ></div>
    </div>
  );
};

export default AudioVisual;
