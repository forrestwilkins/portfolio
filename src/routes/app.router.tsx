import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/App/Layout';
import HelloSound from '../pages/HelloSound';
import HomePage from '../pages/HomePage';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
