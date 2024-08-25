import useAppStore from '@/store/app.store';
import { getToneJS } from '@/utils/shared.utils';
import { useEffect, useRef } from 'react';

const AudioVisual = () => {
  const isAudioEnabled = useAppStore((state) => state.isAudioEnabled);
  const visualRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAudioEnabled) {
      return;
    }

    const playMelody = async () => {
      const Tone = await getToneJS();
      const synth = new Tone.Synth().toDestination();

      // Play a middle 'C' for the duration of an 8th note
      synth.triggerAttackRelease('C4', '8n');
    };

    playMelody();
  }, [isAudioEnabled]);

  return (
    <div className="flex items-center justify-center pt-32">
      <div ref={visualRef} className="h-32 w-32 bg-blue-500"></div>
    </div>
  );
};

export default AudioVisual;
