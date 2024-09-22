import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  PaletteMode,
  SxProps,
  useColorScheme,
} from '@mui/material';
import { MouseEvent, useState } from 'react';

type Mode = PaletteMode | 'system';

interface Props {
  sx?: SxProps;
}

export const ModeToggle = ({ sx }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode, setMode } = useColorScheme();

  const handleBtnClick = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleSelect = (mode: Mode) => {
    setMode(mode);
    setAnchorEl(null);
  };

  const renderIcon = () => {
    if (mode === 'light') {
      return <LightModeOutlined sx={{ color: 'black' }} />;
    }
    return <DarkModeOutlined sx={{ color: 'white' }} />;
  };

  return (
    <Box sx={{ position: 'fixed', ...sx }}>
      <IconButton onClick={handleBtnClick}>{renderIcon()}</IconButton>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleSelect('light')}>Light</MenuItem>
        <MenuItem onClick={() => handleSelect('dark')}>Dark</MenuItem>
        <MenuItem onClick={() => handleSelect('system')}>System</MenuItem>
      </Menu>
    </Box>
  );
};
