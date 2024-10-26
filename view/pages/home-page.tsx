import { Box, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Link from '../components/shared/link';
import { useAboveBreakpoint } from '../hooks/shared.hooks';

const socket = new WebSocket(`ws://localhost:3100/ws`);

socket.onopen = () => {
  console.log('connected');

  socket.send('Hello from client');
};

socket.onmessage = (event) => {
  console.log(`Message from server: ${event.data}`);
};

socket.onerror = (error) => {
  console.error(`WebSocket error`, error);
};

const HomePage = () => {
  const [time, setTime] = useState<string>();

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

      {time && (
        <Box
          position="fixed"
          bottom={10}
          right={10}
          width="fit-content"
          height={10}
          borderRadius={0.5}
          onClick={() => {
            socket.send('Hello from client! 🎉');
          }}
        >
          <Typography fontSize="8px" color="text.secondary">
            {time}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
