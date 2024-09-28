import Link from '@/components/shared/link';
import { useAboveBreakpoint } from '@/hooks/shared.hooks';
import { Box, SxProps } from '@mui/material';

const HomePage = () => {
  const isAboveMd = useAboveBreakpoint('md');
  const isAboveLg = useAboveBreakpoint('lg');

  const linkStyles: SxProps = {
    scrollMargin: '20px',
    fontSize: isAboveMd ? '50px' : '35px',
    fontWeight: 800,
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={isAboveMd ? '4px' : '16px'}
      paddingLeft={isAboveLg ? 0 : '70px'}
      paddingTop={isAboveLg ? 0 : '20px'}
    >
      <Link to="/ripples" sx={linkStyles}>
        Ripples
      </Link>

      <Link to="/color-grid" sx={linkStyles}>
        Color Grid
      </Link>

      <Link to="/modern-jungle" sx={linkStyles}>
        Modern Jungle
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
