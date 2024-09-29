import { ModeToggle } from '@/components/app/mode-toggle';
import Link from '@/components/shared/link';
import { useIsDarkMode } from '@/hooks/shared.hooks';
import { Button } from '@mui/material';
import { useLocation } from 'react-router-dom';

const TopNav = () => {
  const isDarkMode = useIsDarkMode();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  return (
    <div>
      {!isHomePage && (
        <Link to="/">
          <Button
            sx={{
              position: 'fixed',
              left: '12px',
              top: '12px',
              color: isDarkMode ? 'black' : 'white',
              backgroundColor: isDarkMode
                ? 'rgb(255, 255, 255, 0.04)'
                : 'rgb(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgb(255, 255, 255, 0.07)'
                  : 'rgb(0, 0, 0, 0.07)',
              },
            }}
            disableTouchRipple
          >
            Home
          </Button>
        </Link>
      )}

      <ModeToggle sx={{ right: '12px', top: '12px' }} />
    </div>
  );
};

export default TopNav;
