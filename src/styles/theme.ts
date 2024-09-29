// TODO: Move box shadow override to paper ⭐️
// TODO: Create shared dropdown component if needed, shouldn't be needed ideally

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
          padding: 4,
          ...theme.applyStyles('dark', {
            backgroundColor: '#0a0a0a',
            borderColor: '#27272a',
          }),
        }),
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          transition: 'background-color 0.15s cubic-bezier(.4,0,.2,1)',
          '&:hover': { backgroundColor: '#f4f4f5' },
        },
      },
    },
  },
});

export default theme;
