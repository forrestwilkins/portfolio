import { ModeToggle } from '@/components/app-test/mode-toggle';
import Button from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div>
      {!isHomePage && (
        <Link to="/" state={{ rhizome: true }}>
          <Button className="fixed left-3 top-3" variant="secondary" size="sm">
            Home
          </Button>
        </Link>
      )}

      <ModeToggle className="fixed right-3 top-3" />
    </div>
  );
};

export default TopNav;
