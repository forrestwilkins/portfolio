import { Box, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Link from '../components/shared/link';
import { useAboveBreakpoint } from '../hooks/shared.hooks';
import useWebSocket from 'react-use-websocket';
import { getWebSocketURL } from '../utils/shared.utils';

const HomePage = () => {
  const [time, setTime] = useState<string>();

  // TODO: Remove after testing
  useWebSocket(getWebSocketURL(), {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
    },
  });

  const isAboveMd = useAboveBreakpoint('md');
  const isAboveLg = useAboveBreakpoint('lg');

  useEffect(() => {
    const init = async () => {
      const result = await fetch('/api/health');
      const data: { timestamp: string } = await result.json();
      setTime(data.timestamp);
    };
    init();
  }, []);

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

      <Link to="/audio-visual" sx={linkStyles}>
        Audio Visual
      </Link>

      <Link to="/hello-sound" sx={linkStyles}>
        Hello Sound
      </Link>

      <Link to="/sockets" sx={linkStyles}>
        Sockets
      </Link>

      {time && (
        <Box
          position="fixed"
          bottom={10}
          right={10}
          width="fit-content"
          height={10}
        >
          <Typography
            fontSize="8px"
            color="text.secondary"
            borderRadius="2px"
            paddingX={0.3}
            sx={{
              '&:hover': { color: 'text.primary' },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {time}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
