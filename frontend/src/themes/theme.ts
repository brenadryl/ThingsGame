import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    outlinedHeader: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    outlinedHeader?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    outlinedHeader: true;
  }
}

// Module augmentation to add custom background keys to MUI's Palette
declare module '@mui/material/styles' {
  interface Palette {
    customBackground: {
      light: string;
      dark: string;
    };
  }
  interface PaletteOptions {
    customBackground?: {
      light?: string;
      dark?: string;
    };
  }
}

// Define the color palettes
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#FFD700', contrastText: '#FFFFFF' }, // Electric Yellow (Primary Accent)
        secondary: { main: '#FF6B35', contrastText: '#FFFFFF', light: '#A9A9A9'}, // Bright Orange (Interactive Elements)
        error: { main: '#FF3F34' }, // Sunset Red (Error & Alerts)
        warning: { main: '#A7D129', contrastText: "#005F73", light: '#A7D129' }, // Lime Green (Success & Highlights)
        info: { main: '#00C9A7', contrastText: '#FFFFFF'}, // Aqua Blue (Secondary UI)
        success: { main: '#38B6FF', light:'#54938AFF' }, // Sky Blue (Active & Hover States)
        background: { 
          default: '#EEECECFF', // Off-White (Main Background)
          paper: '#F8F8F8', // Cards and UI Components
        },
        text: { 
          primary: '#333333', // Dark Gray (Text Readability)
          secondary: '#005F73', // Deep Blue (Less Prominent Text)
        },
      },
      typography: {
        fontFamily: "'Poppins', sans-serif",
        h1: { fontSize: '2.5rem', fontWeight: 1000, color: '#333333' },
        h2: { fontSize: '2rem', fontWeight: 900, color: '#333333' },
        h3: { fontSize: '1.5rem', fontWeight: 800, color: '#333333' },
        h4: { fontSize: '1.4rem', fontWeight: 800, color: '#333333' },
        h5: { fontSize: '1.15rem', fontWeight: 800, color: '#333333' },
        body1: { fontSize: '1rem', fontWeight: 800, color: '#333333' },
        body2: { fontSize: '0.75rem', fontWeight: 800, color: '#333333' },
        button: { textTransform: 'none', fontWeight: 800 },
        outlinedHeader: {
          fontFamily: "'Chewy', cursive",
          WebkitTextStroke: '1px #005F73',
          color: "#FFD700",
          fontWeight: 700,
          fontSize: '3rem'
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              fontWeight: 600,
              '&:hover': { opacity: 0.9 },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: '#00C9A7', // Deep Blue for Navigation
            },
          },
        },
      },
});

export const darkTheme = createTheme({
  palette: {
      mode: 'dark',
      primary: { main: '#FFD700', contrastText: '#2A2A2A' }, // Electric Yellow (Primary Accent)
      secondary: { main: '#FF6B35', contrastText: '#2A2A2A', light: '#A9A9A9' }, // Bright Orange (Interactive Elements)
      error: { main: '#FF3F34' }, // Sunset Red (Error & Alerts)
      warning: { main: '#A7D129', contrastText: "#FFFFFF", light: '#6F8684FF' }, // Lime Green (Success & Highlights)
      info: { main: '#00C9A7', contrastText: '#2A2A2A' }, // Aqua Blue (Secondary UI)
      success: { main: '#38B6FF', light:'#6F8684FF' }, // Sky Blue (Active & Hover States)
      background: { 
        default: '#2A2A2A', // Dark Gray (Dark Mode Background)
        paper: '#515151FF', // Slightly lighter for contrast
      },
      text: { 
        primary: '#FFFFFF', // White for readability
        secondary: '#A7D129', // Lime Green for accents
      },
    },
    typography: {
      fontFamily: "'Poppins', sans-serif",
      h1: { fontSize: '2.5rem', fontWeight: 1000, color: '#FFFFFF' },
      h2: { fontSize: '2rem', fontWeight: 900, color: '#FFFFFF' },
      h3: { fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' },
      h4: { fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' },
      h5: { fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' },
      body1: { fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' },
      body2: { fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' },
      button: { textTransform: 'none', fontWeight: 800 },
      outlinedHeader: {
        fontFamily: "'Chewy', cursive",
        WebkitTextStroke: '.8px #005F73',
        color: "#FFD700",
        fontWeight: 700,
        fontSize: '3rem'
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            fontWeight: 600,
            '&:hover': { opacity: 0.9 },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#00C9A7', // Deep Blue for Navigation
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          // Error Alert: vibrant orange background with white text
          standardError: {
            backgroundColor: '#FF6B35',
            color: '#FFFFFF',
          },
          // Success Alert: lime green background with white text
          standardSuccess: {
            backgroundColor: '#A7D129',
            color: '#FFFFFF',
          },
          // Info Alert: bright gold background with white text
          standardInfo: {
            backgroundColor: '#FFD700',
            color: '#FFFFFF',
          },
        },
      },
    },
  
});


export const darkTempTheme = createTheme({
  palette: {
    // Primary color for nav bar, logo, and interactive link text
    primary: {
      main: '#00C9A7',
    },
    // Secondary used for primary button actions (bright gold)
    secondary: {
      main: '#FFD700',
      contrastText: '#121212',
    },
    // Success palette used for secondary button actions (lime green)
    success: {
      main: '#A7D129',
      contrastText: '#121212',
    },
    // Error palette used for alerts and outlined button (vibrant orange)
    error: {
      main: '#FF6B35',
      contrastText: '#FFFFFF',
    },
    // Background shades
    background: {
      default: '#121212', // Primary background
      paper: '#1E1E1E',   // Used for panels and cards
    },
    customBackground: {
      light: '#2C2C2C',
      dark: '#0D0D0D',
    },
    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#757575',
    },
    // Divider color
    divider: '#333333',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#00C9A7', // Nav bar color
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Optional: disable uppercase
        },
      },
      variants: [
        // Primary button using bright gold for main actions
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            backgroundColor: '#FFD700',
            color: '#121212',
            '&:hover': {
              backgroundColor: '#E6C200',
            },
            '&:active': {
              backgroundColor: '#CCA300',
            },
          },
        },
        // Secondary button using lime green for alternative actions
        {
          props: { variant: 'contained', color: 'success' },
          style: {
            backgroundColor: '#A7D129',
            color: '#121212',
            '&:hover': {
              backgroundColor: '#96BD23',
            },
            '&:active': {
              backgroundColor: '#85B127',
            },
          },
        },
        // Tertiary / outlined button using vibrant orange for subtle actions
        {
          props: { variant: 'outlined', color: 'error' },
          style: {
            borderColor: '#FF6B35',
            color: '#FF6B35',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.08)', // Subtle translucent fill on hover
            },
          },
        },
      ],
    },
    MuiAlert: {
      styleOverrides: {
        // Error Alert: vibrant orange background with white text
        standardError: {
          backgroundColor: '#FF6B35',
          color: '#FFFFFF',
        },
        // Success Alert: lime green background with white text
        standardSuccess: {
          backgroundColor: '#A7D129',
          color: '#FFFFFF',
        },
        // Info Alert: bright gold background with white text
        standardInfo: {
          backgroundColor: '#FFD700',
          color: '#FFFFFF',
        },
      },
    },
  },
});