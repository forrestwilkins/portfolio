import { Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const HomePage = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        padding: '80px 70px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      <Link
        to="/ripples"
        state={{ rhizome: true, prev: location.pathname }}
        className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
      >
        Ripples
      </Link>

      <Link
        to="/color-grid"
        state={{ rhizome: true, prev: location.pathname }}
        className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
      >
        Color Grid
      </Link>

      <Link
        to="/audio-visual"
        state={{ rhizome: true, prev: location.pathname }}
        className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
      >
        Audio Visual
      </Link>

      <Link
        to="/hello-sound"
        state={{ rhizome: true, prev: location.pathname }}
        className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
      >
        Hello Sound
      </Link>
    </Box>
  );
};

export default HomePage;
