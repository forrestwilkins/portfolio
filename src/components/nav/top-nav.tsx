import { ModeToggle } from '@/components/app/mode-toggle';
import Link from '@/components/shared/link';
import { Button } from '@mui/material';
import { useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  return (
    <>
      {!isHomePage && (
        <Link
          to="/"
          sx={{ position: 'fixed', left: '12px', top: '12px', zIndex: 10 }}
        >
          <Button variant="contained" disableTouchRipple>
            Home
          </Button>
        </Link>
      )}

      <ModeToggle sx={{ right: '12px', top: '12px', zIndex: 10 }} />
    </>
  );
};

export default TopNav;
