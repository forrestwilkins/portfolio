import Link from '@/components/shared/link';
import { Box } from '@mui/material';

const HomePage = () => (
  <Box
    sx={{
      padding: '80px 70px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}
  >
    <Link
      to="/ripples"
      sx={{ scrollMargin: '20px', fontSize: '36px', fontWeight: 800 }}
    >
      Ripples
    </Link>

    <Link
      to="/color-grid"
      sx={{ scrollMargin: '20px', fontSize: '36px', fontWeight: 800 }}
    >
      Color Grid
    </Link>

    <Link
      to="/audio-visual"
      sx={{ scrollMargin: '20px', fontSize: '36px', fontWeight: 800 }}
    >
      Audio Visual
    </Link>

    <Link
      to="/hello-sound"
      sx={{ scrollMargin: '20px', fontSize: '36px', fontWeight: 800 }}
    >
      Hello Sound
    </Link>
  </Box>
);

export default HomePage;
