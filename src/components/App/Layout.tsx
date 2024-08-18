// TODO: Add styles for the layout

import { CSSProperties, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
}

const Layout = ({ children, style }: Props) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const btnStyle: CSSProperties = {
    color: 'rgb(210, 210, 210)',
    position: 'fixed',
    top: '10px',
    left: '13px',
    cursor: 'pointer',
    userSelect: 'none',
    textDecoration: 'none',
    fontWeight: '500',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '6px 10px',
    borderRadius: '5px',
    zIndex: 1,
  };

  return (
    <div style={{ padding: '50px 50px 0', position: 'relative', ...style }}>
      {!isHomePage && (
        <Link to="/" state={{ rhizome: true }} style={btnStyle}>
          home
        </Link>
      )}

      {children}
    </div>
  );
};

export default Layout;
