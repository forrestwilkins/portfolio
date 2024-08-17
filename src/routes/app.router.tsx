import { createBrowserRouter } from 'react-router-dom';
import App from '../components/App/App';
import ErrorPage from '../pages/ErrorPage';
import HelloSound from '../pages/HelloSound';
import HomePage from '../pages/HomePage';
import PageNotFound from '../pages/PageNotFound';

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
      {
        path: '*',
        element: <PageNotFound />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

export default appRouter;
