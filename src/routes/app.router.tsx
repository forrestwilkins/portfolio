import { createBrowserRouter } from 'react-router-dom';
import App from '../components/App/App';
import HelloSound from '../pages/HelloSound';
import HomePage from '../pages/HomePage';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'hello-sound',
        element: <HelloSound />,
      },
    ],
  },
]);

export default appRouter;
