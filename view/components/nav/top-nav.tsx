// TODO: Add refresh button for certain pages

import {
  Clear,
  DarkMode,
  Fullscreen,
  HomeRounded,
  LightModeOutlined,
  MenuRounded,
  Pause,
  PlayArrow,
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
import { useIsDarkMode } from '../../hooks/shared.hooks';
import { ripplesRef } from '../../pages/ripples/ripples.refs';
import useAppStore from '../../store/app.store';
import { sleep } from '../../utils/shared.utils';
import { canvasRef } from '../shared/canvas/canvas.refs';
import { clearCanvas } from '../shared/canvas/canvas.utils';

const TopNav = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isCanvasPaused = useAppStore((state) => state.isCanvasPaused);
  const setIsCanvasPaused = useAppStore((state) => state.setIsCanvasPaused);

  const { setMode } = useColorScheme();
  const isDarkMode = useIsDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  const isRipples = location.pathname === '/ripples';
  const isSockets = location.pathname === '/sockets';
  const iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
  const showClearCanvas = isRipples || isSockets;

  const PauseIcon = isCanvasPaused ? PlayArrow : Pause;

  const handleModeToggleClick = async () => {
    setAnchorEl(null);
    await sleep(100);
    setMode(isDarkMode ? 'light' : 'dark');
  };

  const handlePauseBtnClick = () => {
    setIsCanvasPaused(!isCanvasPaused);
    setAnchorEl(null);
  };

  const handleClearCanvasClick = () => {
    ripplesRef.current = [];
    clearCanvas();
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
          sx={{ '& .MuiMenu-list': { minWidth: '180px' } }}
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

          {showClearCanvas && (
            <MenuItem onClick={handleClearCanvasClick}>
              <Clear fontSize="small" sx={{ marginRight: '1.25ch' }} />
              Clear canvas
            </MenuItem>
          )}

          {isRipples && (
            <MenuItem onClick={handlePauseBtnClick}>
              <PauseIcon fontSize="small" sx={{ marginRight: '1.25ch' }} />
              {isCanvasPaused ? 'Play' : 'Pause'} canvas
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
