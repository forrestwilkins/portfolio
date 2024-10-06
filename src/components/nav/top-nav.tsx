import { canvasRef } from '@/components/shared/canvas/canvas-ref';
import { useIsDarkMode } from '@/hooks/shared.hooks';
import { sleep } from '@/utils/shared.utils';
import {
  DarkMode,
  Fullscreen,
  HomeRounded,
  LightModeOutlined,
  MenuRounded,
} from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem, useColorScheme } from '@mui/material';
import { MouseEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TopNav = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { setMode } = useColorScheme();
  const isDarkMode = useIsDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  const iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
  const isRipples = location.pathname === '/ripples';

  const handleModeToggleClick = async () => {
    setAnchorEl(null);
    await sleep(100);
    setMode(isDarkMode ? 'light' : 'dark');
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
        <MenuItem onClick={() => navigate('/')}>
          <HomeRounded fontSize="small" sx={{ marginRight: '1.25ch' }} /> Home
        </MenuItem>

        {isRipples && !iOS && (
          <MenuItem onClick={() => canvasRef.current?.requestFullscreen()}>
            <Fullscreen fontSize="small" sx={{ marginRight: '1.25ch' }} />
            Fullscreen
          </MenuItem>
        )}

        <MenuItem onClick={handleModeToggleClick}>
          {renderModeToggle()}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TopNav;
