import { useIsLightMode } from '@/hooks/shared.hooks';
import useAppStore from '@/store/app.store';
import { getToneJS } from '@/utils/audio.utils';
import { getRandom } from '@/utils/math.utils';
import { getRandomRGB } from '@/utils/visual.utils';
import { Box, SxProps } from '@mui/material';
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
  const isLightMode = useIsLightMode();

  const btnStles: SxProps = {
    width: '128px',
    height: '128px',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    bgcolor: isLightMode ? 'grey.900' : 'grey.100',
    '&:hover': { transform: 'scale(1.1)', bgcolor: '#2e8b57' },
  };

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
    <Box display="flex" justifyContent="center" paddingTop="15vh">
      <Box ref={visualRef} sx={btnStles} onClick={handleClick} />
    </Box>
  );
};

export default AudioVisual;
