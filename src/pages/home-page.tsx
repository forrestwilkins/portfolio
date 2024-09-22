import Link from '@/components/shared/link';
import { Box, SxProps } from '@mui/material';

const HomePage = () => {
  const linkStyles: SxProps = {
    scrollMargin: '20px',
    fontSize: '50px',
    fontWeight: 800,
  };

  return (
    <Box display="flex" flexDirection="column" gap="4px">
      <Link to="/ripples" sx={linkStyles}>
        Ripples
      </Link>

      <Link to="/color-grid" sx={linkStyles}>
        Color Grid
      </Link>

      <Link to="/audio-visual" sx={linkStyles}>
        Audio Visual
      </Link>

      <Link to="/hello-sound" sx={linkStyles}>
        Hello Sound
      </Link>
    </Box>
  );
};

export default HomePage;
