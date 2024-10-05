import { createTheme, Theme } from '@mui/material/styles';

interface Props<OwnerState = unknown> {
  theme: Theme;
  ownerState: OwnerState;
}

const theme = createTheme({
  typography: {
    fontFamily: 'system-ui',
  },
  colorSchemes: {
    light: {
      palette: {
        divider: '#e4e4e7',
      },
    },
    dark: {
      palette: {
        background: {
          default: '#0a0a0a',
        },
        divider: '#27272a',
      },
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        elevation: {
          boxShadow: `
            0 0 #0000,
            0 0 #0000,
            0 4px 6px -1px rgba(0,0,0,.1),
            0 2px 4px -2px rgba(0,0,0,.1)
          `,
        },
      },
    },

    MuiContainer: {
      styleOverrides: {
        root: ({ theme }: Props) => ({
          paddingTop: '70px',

          [theme.breakpoints.up('md')]: {
            paddingTop: '100px',
          },
        }),
      },
    },

    MuiButton: {
      styleOverrides: {
        contained: ({ theme }: Props) => ({
          textTransform: 'none',
          backgroundColor: 'rgb(0, 0, 0, 0.04)',
          '&:hover': {
            backgroundColor: 'rgb(0, 0, 0, 0.07)',
            boxShadow: 'none',
          },
          boxShadow: 'none',
          color: 'black',

          ...theme.applyStyles('dark', {
            backgroundColor: 'rgb(255, 255, 255, 0.04)',
            '&:hover': { backgroundColor: 'rgb(255, 255, 255, 0.07)' },
            color: 'white',
          }),
        }),
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          '& .MuiTouchRipple-root .MuiTouchRipple-child': {
            borderRadius: 7,
          },
        },
      },
    },

    MuiSvgIcon: {
      styleOverrides: {
        root: ({ theme }: Props) => ({
          color: theme.palette.common.black,
          ...theme.applyStyles('dark', {
            color: theme.palette.common.white,
          }),
        }),
      },
    },

    MuiMenu: {
      styleOverrides: {
        list: ({ theme }: Props) => ({
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          padding: 4,
          ...theme.applyStyles('dark', {
            backgroundColor: theme.palette.background.default,
            borderColor: theme.palette.divider,
          }),
        }),
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }: Props) => ({
          borderRadius: 4,
          transition: 'background-color 0.15s cubic-bezier(.4,0,.2,1)',

          '&:hover': {
            backgroundColor: 'rgb(0, 0, 50, 0.04)',
            ...theme.applyStyles('dark', {
              backgroundColor: 'rgb(205, 205, 255, 0.1)',
            }),
          },
        }),
      },
    },
  },
});

export default theme;
