import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { ThemeProvider } from './ThemeProvider';

const App = () => {
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

  return (
    <ThemeProvider>
      <Layout>
        <Outlet />
      </Layout>
    </ThemeProvider>
  );
};

export default App;
