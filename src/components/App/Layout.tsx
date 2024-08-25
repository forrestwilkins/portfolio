import { Button } from '@/components/shared/button';
import { cn } from '@/utils/shared.utils';
import { CSSProperties, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

const Layout = ({ children, style, className }: Props) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className={cn('p-24', className)} style={{ ...style }}>
      {!isHomePage && (
        <Link to="/" state={{ rhizome: true }}>
          <Button
            className="fixed left-3 top-3 z-10 bg-zinc-900 text-gray-400"
            variant="secondary"
            size="sm"
          >
            Home
          </Button>
        </Link>
      )}

      {children}
    </div>
  );
};

export default Layout;
