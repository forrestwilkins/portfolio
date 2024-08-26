import Layout from '@/components/app/layout';
import ThemeProvider from '@/components/app/theme-provider';
import useAppStore from '@/store/app.store';
import { getToneJS } from '@/utils/shared.utils';
import { useCallback, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const App = () => {
  const isAudioEnabled = useAppStore((state) => state.isAudioEnabled);
  const setIsAudioEnabled = useAppStore((state) => state.setIsAudioEnabled);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const lastVisitedPage = localStorage.getItem('last-visited-page');
    if (lastVisitedPage && !location.state?.rhizome) {
      navigate(lastVisitedPage);
      return;
    }

    localStorage.setItem('last-visited-page', location.pathname);
  }, [navigate, location.pathname, location.state?.rhizome]);

  const enableAudio = useCallback(async () => {
    if (isAudioEnabled) {
      return;
    }

    const Tone = await getToneJS();
    await Tone.start();

    setIsAudioEnabled(true);
    console.log('Audio enabled.');
  }, [isAudioEnabled, setIsAudioEnabled]);

  useEffect(() => {
    window.addEventListener('keydown', enableAudio);
    return () => {
      window.removeEventListener('keydown', enableAudio);
    };
  }, [enableAudio]);

  return (
    <ThemeProvider>
      <Layout onClick={enableAudio}>
        <Outlet />
      </Layout>
    </ThemeProvider>
  );
};

export default App;
