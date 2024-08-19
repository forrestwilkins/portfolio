import { CSSProperties, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
}

const Layout = ({ children, style }: Props) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="p-12" style={{ ...style }}>
      {!isHomePage && (
        <Link
          to="/"
          state={{ rhizome: true }}
          className="fixed top-3 left-3 text-gray-400 cursor-pointer select-none no-underline font-medium bg-zinc-900 px-2 py-1 rounded-md z-10"
        >
          home
        </Link>
      )}

      {children}
    </div>
  );
};

export default Layout;
