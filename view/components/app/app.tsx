import Layout from '@/components/app/layout';
import useAppStore from '@/store/app.store';
import theme from '@/styles/theme';
import { getToneJS } from '@/utils/audio.utils';
import { isTouchDevice } from '@/utils/shared.utils';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
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
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['Space', 'Enter', 'Key', 'Digit'].some((key) => e.code.includes(key))
      ) {
        enableAudio();
      }
    };

    // Prevent context menu for long-press on mobile
    const handleContextMenu = (e: MouseEvent) => {
      if (isTouchDevice()) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', enableAudio);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', enableAudio);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isAudioEnabled, setIsAudioEnabled]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Outlet />
      </Layout>
    </ThemeProvider>
  );
};

export default App;
