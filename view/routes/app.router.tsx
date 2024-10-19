import { createBrowserRouter } from 'react-router-dom';
import App from '../components/app/app';
import AudioVisual from '../pages/audio-visual';
import ColorGrid from '../pages/color-grid';
import ErrorPage from '../pages/error-page';
import HelloSound from '../pages/hello-sound';
import HomePage from '../pages/home-page';
import PageNotFound from '../pages/page-not-found';
import Ripples from '../pages/ripples/ripples';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'hello-sound',
        element: <HelloSound />,
      },
      {
        path: 'audio-visual',
        element: <AudioVisual />,
      },
      {
        path: 'color-grid',
        element: <ColorGrid />,
      },
      {
        path: 'ripples',
        element: <Ripples />,
      },
      {
        path: '*',
        element: <PageNotFound />,
      },
    ],
  },
]);

export default appRouter;
