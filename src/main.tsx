import '@radix-ui/themes/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import appRouter from './routes/app.router.tsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={appRouter} />
  </React.StrictMode>,
);
