import Layout from '@/components/app/layout';
import useAppStore from '@/store/app.store';
import { getToneJS } from '@/utils/audio.utils';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const App = () => {
  const isAudioEnabled = useAppStore((state) => state.isAudioEnabled);
  const setIsAudioEnabled = useAppStore((state) => state.setIsAudioEnabled);

  useEffect(() => {
    const enableAudio = async () => {
      if (isAudioEnabled) {
        return;
      }

      const Tone = await getToneJS();
      await Tone.start();

      setIsAudioEnabled(true);
      console.log('Audio enabled.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['Space', 'Enter', 'Key', 'Digit'].some((key) => e.code.includes(key))
      ) {
        enableAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', enableAudio);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', enableAudio);
    };
  }, [isAudioEnabled, setIsAudioEnabled]);

  return (
    <ThemeProvider attribute="class">
      <Theme>
        <Layout>
          <Outlet />
        </Layout>
      </Theme>
    </ThemeProvider>
  );
};

export default App;
