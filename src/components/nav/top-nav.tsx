import { ModeToggle } from '@/components/app/mode-toggle';
import Link from '@/components/shared/link';
import { Button, SxProps } from '@mui/material';
import { useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const homeBtnStyles: SxProps = {
    position: 'fixed',
    left: '12px',
    top: '12px',
    zIndex: 10,
  };

  const modeToggleStyles: SxProps = {
    ...homeBtnStyles,
    left: 'unset',
    right: '12px',
  };

  return (
    <>
      {!isHomePage && (
        <Link to="/" sx={homeBtnStyles}>
          <Button variant="contained" disableTouchRipple>
            Home
          </Button>
        </Link>
      )}

      <ModeToggle sx={modeToggleStyles} />
    </>
  );
};

export default TopNav;
