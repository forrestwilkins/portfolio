import { ModeToggle } from '@/components/app/mode-toggle';
import Link from '@/components/shared/link';
import { useColorScheme } from '@/hooks/shared.hooks';
import { Button } from '@mui/material';
import { useLocation } from 'react-router-dom';

const TopNav = () => {
  const isLightMode = useColorScheme();
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
              color: isLightMode ? 'black' : 'white',
              backgroundColor: isLightMode
                ? 'rgb(0, 0, 0, 0.04)'
                : 'rgb(255, 255, 255, 0.04)',
              '&:hover': {
                backgroundColor: isLightMode
                  ? 'rgb(0, 0, 0, 0.07)'
                  : 'rgb(255, 255, 255, 0.07)',
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
