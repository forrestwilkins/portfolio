// TODO: Add styles for the layout

import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const Layout = () => {
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
    <div style={{ padding: '50px 50px 0' }}>
      <Outlet />
    </div>
  );
};

export default Layout;
