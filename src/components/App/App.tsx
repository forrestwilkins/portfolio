import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Layout from './Layout';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('last-visited-page', location.pathname);
  }, [location]);

  useEffect(() => {
    const lastVisitedPage = localStorage.getItem('last-visited-page');
    if (lastVisitedPage) {
      navigate(lastVisitedPage, { replace: true });
    }
  }, [navigate]);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default App;
