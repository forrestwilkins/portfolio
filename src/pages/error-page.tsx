import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

const ErrorPage = () => {
  const [textColor, setTextColor] = useState('white');
  const [backgroundColor, setBackgroundColor] = useState('black');

  useEffect(() => {
    const interval = setInterval(() => {
      setTextColor(
        `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255,
        )}, ${Math.floor(Math.random() * 255)})`,
      );

      setBackgroundColor(
        `rgb(${Math.floor(Math.random() * 55)}, ${Math.floor(
          Math.random() * 55,
        )}, ${Math.floor(Math.random() * 55)})`,
      );
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Box
      sx={{
        transition: 'all 0.5s',
        height: '100vh',
        bgcolor: backgroundColor,
      }}
    >
      <Box
        sx={{
          color: textColor,
          fontSize: '30px',
          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '50px 70px',
        }}
      >
        Something went wrong.
      </Box>
    </Box>
  );
};

export default ErrorPage;
