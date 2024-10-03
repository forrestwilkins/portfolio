import { ModeToggle } from '@/components/app/mode-toggle';
import Link from '@/components/shared/link';
import { useAboveBreakpoint } from '@/hooks/shared.hooks';
import { Menu } from '@mui/icons-material';
import { Box, Button, IconButton } from '@mui/material';
import { useLocation } from 'react-router-dom';

const TopNav = () => {
  const isAboveMd = useAboveBreakpoint('md');
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isRipplePage = location.pathname === '/ripple';

  return (
    <>
      {!isHomePage && (
        <Link to="/">
          <Button
            variant="contained"
            disableTouchRipple
            sx={{
              position: 'fixed',
              left: '12px',
              top: '12px',
            }}
          >
            Home
          </Button>
        </Link>
      )}

      <IconButton>
        <Menu />
      </IconButton>

      <Box
        sx={{
          position: 'fixed',
          right: '12px',
          top: '12px',
          display: 'flex',
          flexDirection: isAboveMd ? 'row' : 'column',
        }}
      >
        <ModeToggle />
      </Box>
    </>
  );
};

export default TopNav;
