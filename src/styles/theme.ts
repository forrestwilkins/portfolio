import { createTheme } from '@mui/material/styles';

const initialTheme = createTheme({
  typography: {
    fontFamily: 'system-ui',
  },
});

const theme = createTheme(initialTheme, {
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: 20,
        },
      },
    },
  },
});

export default theme;
