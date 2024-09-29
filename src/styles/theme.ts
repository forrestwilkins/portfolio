// TODO: Make background smaller for menu items, rounded corners
// TODO: Create shared dropdown component if needed
// TODO: Move box shadow override to paper

import { createTheme, Theme } from '@mui/material/styles';

interface ThemeProps<OwnerState = any> {
  theme: Theme;
  ownerState: OwnerState;
}

const theme = createTheme({
  typography: {
    fontFamily: 'system-ui',
  },
  colorSchemes: {
    dark: {
      palette: {
        background: {
          default: '#0a0a0a',
        },
      },
    },
    light: true,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }: ThemeProps) => ({
          paddingTop: '70px',

          [theme.breakpoints.up('md')]: {
            paddingTop: '100px',
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            boxShadow: `
                0 0 #0000,
                0 0 #0000,
                0 4px 6px -1px rgba(0,0,0,.1),
                0 2px 4px -2px rgba(0,0,0,.1)
              `,
          },
        },
        list: ({ theme }: ThemeProps) => ({
          borderRadius: 4,
          border: `1px solid #e4e4e7`,

          ...theme.applyStyles('dark', {
            backgroundColor: '#0a0a0a',
            borderColor: '#27272a',
          }),
        }),
      },
    },
  },
});

export default theme;
