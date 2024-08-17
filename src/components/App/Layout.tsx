// TODO: Add styles for the layout

import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div style={{ padding: '50px 50px 0' }}>
      <Outlet />
    </div>
  );
};

export default Layout;
