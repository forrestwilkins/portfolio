import { ModeToggle } from '@/components/app/mode-toggle';
import Button from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div>
      {!isHomePage && (
        <Link to="/">
          <Button
            className="fixed left-3 top-3 select-none"
            variant="secondary"
            size="sm"
          >
            Home
          </Button>
        </Link>
      )}

      <ModeToggle className="fixed right-3 top-3" />
    </div>
  );
};

export default TopNav;
