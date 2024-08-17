import { RouterProvider } from 'react-router-dom';
import appRouter from './routes/app.router';
import './globals.css';

const App = () => <RouterProvider router={appRouter} />;

export default App;
