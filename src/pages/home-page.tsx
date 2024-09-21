import Link from '@/components/shared/link';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

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
        sx={{ scrollMargin: '20px', fontSize: '36px', fontWeight: 800 }}
      >
        Ripples
      </Link>

      <Link
        to="/color-grid"
        state={{ rhizome: true, prev: location.pathname }}
        sx={{ scrollMargin: '20px', fontSize: '36px', fontWeight: 800 }}
      >
        Color Grid
      </Link>

      <Link
        to="/audio-visual"
        state={{ rhizome: true, prev: location.pathname }}
        sx={{ scrollMargin: '20px', fontSize: '36px', fontWeight: 800 }}
      >
        Audio Visual
      </Link>

      <Link
        to="/hello-sound"
        state={{ rhizome: true, prev: location.pathname }}
        sx={{ scrollMargin: '20px', fontSize: '36px', fontWeight: 800 }}
      >
        Hello Sound
      </Link>
    </Box>
  );
};

export default HomePage;
