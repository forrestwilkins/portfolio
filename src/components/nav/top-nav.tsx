import { ModeToggle } from '@/components/app/mode-toggle';
import { canvasRef } from '@/components/shared/canvas/canvas-ref';
import Link from '@/components/shared/link';
import { Fullscreen } from '@mui/icons-material';
import { Box, Button, IconButton, SxProps } from '@mui/material';
import { useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isRipples = location.pathname === '/ripples';
  const iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

  const leftNavStyles: SxProps = {
    position: 'fixed',
    left: '12px',
    top: '12px',
    zIndex: 10,
  };

  const rightNavStyles: SxProps = {
    ...leftNavStyles,
    left: 'unset',
    right: '12px',
    display: 'flex',
  };

  return (
    <>
      {!isHomePage && (
        <Link to="/" sx={leftNavStyles}>
          <Button variant="contained" disableTouchRipple>
            Home
          </Button>
        </Link>
      )}

      <Box sx={rightNavStyles}>
        {isRipples && !iOS && (
          <IconButton onClick={() => canvasRef.current?.requestFullscreen()}>
            <Fullscreen />
          </IconButton>
        )}

        <ModeToggle />
      </Box>
    </>
  );
};

export default TopNav;
