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
          className="fixed left-3 top-3 z-10 cursor-pointer select-none rounded-md bg-zinc-900 px-2 py-1 font-medium text-gray-400 no-underline"
        >
          home
        </Link>
      )}

      {children}
    </div>
  );
};

export default Layout;
