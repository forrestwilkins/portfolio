import { canvasRef } from '@/components/shared/canvas/canvas-ref';
import { useIsDarkMode } from '@/hooks/shared.hooks';
import { ripplesRef } from '@/pages/ripples/ripples-ref';
import { sleep } from '@/utils/shared.utils';
import {
  Clear,
  DarkMode,
  Fullscreen,
  HomeRounded,
  LightModeOutlined,
  MenuRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useColorScheme,
} from '@mui/material';
import { MouseEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TopNav = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { setMode } = useColorScheme();
  const isDarkMode = useIsDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  const iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

  const isHome = location.pathname === '/';
  const isRipples = location.pathname === '/ripples';

  const handleModeToggleClick = async () => {
    setAnchorEl(null);
    await sleep(100);
    setMode(isDarkMode ? 'light' : 'dark');
  };

  const handleClearCanvasClick = () => {
    if (!canvasRef.current) {
      return;
    }
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const { width, height } = canvasRef.current;
      ctx.clearRect(0, 0, width, height);
      ripplesRef.current = [];
    }
    setAnchorEl(null);
  };

  const renderModeToggle = () => {
    if (isDarkMode) {
      return (
        <>
          <LightModeOutlined fontSize="small" sx={{ marginRight: '1.25ch' }} />
          Light mode
        </>
      );
    }
    return (
      <>
        <DarkMode fontSize="small" sx={{ marginRight: '1.25ch' }} />
        Dark mode
      </>
    );
  };

  return (
    <>
      {!isHome && (
        <Box position="fixed" left="12px" top="12px" zIndex={10} display="flex">
          <Button variant="contained" onClick={() => navigate('/')}>
            Home
          </Button>
        </Box>
      )}

      <Box position="fixed" right="12px" top="12px" zIndex={10} display="flex">
        <IconButton
          onClick={(e: MouseEvent<HTMLButtonElement>) =>
            setAnchorEl(e.currentTarget)
          }
        >
          <MenuRounded />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/');
            }}
          >
            <HomeRounded fontSize="small" sx={{ marginRight: '1.25ch' }} />
            Home
          </MenuItem>

          {isRipples && !iOS && (
            <MenuItem onClick={() => canvasRef.current?.requestFullscreen()}>
              <Fullscreen fontSize="small" sx={{ marginRight: '1.25ch' }} />
              Fullscreen
            </MenuItem>
          )}

          {isRipples && (
            <MenuItem onClick={handleClearCanvasClick}>
              <Clear fontSize="small" sx={{ marginRight: '1.25ch' }} />
              Clear canvas
            </MenuItem>
          )}

          <MenuItem onClick={handleModeToggleClick}>
            {renderModeToggle()}
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
};

export default TopNav;
