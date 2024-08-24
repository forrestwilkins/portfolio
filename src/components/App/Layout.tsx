import { CSSProperties, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/shared.utils';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

const Layout = ({ children, style, className }: Props) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className={cn('p-12', className)} style={{ ...style }}>
      {!isHomePage && (
        <Link
          to="/"
          state={{ rhizome: true }}
          className="fixed left-3 top-3 z-10 cursor-pointer select-none rounded-md bg-zinc-900 px-2 py-1 text-gray-400 no-underline"
        >
          home
        </Link>
      )}

      {children}
    </div>
  );
};

export default Layout;
