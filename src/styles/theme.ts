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
          paddingTop: 8,

          [initialTheme.breakpoints.up('sm')]: {
            paddingTop: 16,
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;
