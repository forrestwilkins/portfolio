import { ModeToggle } from '@/components/app/mode-toggle';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div>
      {!isHomePage && (
        <Link to="/" state={{ rhizome: true }}>
          <Button
            className="fixed left-3 top-3 z-10"
            variant="secondary"
            size="sm"
          >
            Home
          </Button>
        </Link>
      )}

      <ModeToggle />
    </div>
  );
};

export default TopNav;
