import { createTheme } from '@mui/material/styles';

// Define the color palettes
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#FFD700', contrastText: '#FFFFFF' }, // Electric Yellow (Primary Accent)
        secondary: { main: '#FF6B35', contrastText: '#FFFFFF'}, // Bright Orange (Interactive Elements)
        error: { main: '#FF3F34' }, // Sunset Red (Error & Alerts)
        warning: { main: '#A7D129' }, // Lime Green (Success & Highlights)
        info: { main: '#00C9A7', contrastText: '#FFFFFF'}, // Aqua Blue (Secondary UI)
        success: { main: '#38B6FF' }, // Sky Blue (Active & Hover States)
        background: { 
          default: '#F8F8F8', // Off-White (Main Background)
          paper: '#FFFFFF', // Cards and UI Components
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
        body1: { fontSize: '1rem', fontWeight: 800, color: '#333333' },
        button: { textTransform: 'none', fontWeight: 800 },
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
        secondary: { main: '#FF6B35', contrastText: '#2A2A2A' }, // Bright Orange (Interactive Elements)
        error: { main: '#FF3F34' }, // Sunset Red (Error & Alerts)
        warning: { main: '#A7D129' }, // Lime Green (Success & Highlights)
        info: { main: '#00C9A7', contrastText: '#2A2A2A' }, // Aqua Blue (Secondary UI)
        success: { main: '#38B6FF' }, // Sky Blue (Active & Hover States)
        background: { 
          default: '#1E1E1E', // Dark Gray (Dark Mode Background)
          paper: '#2A2A2A', // Slightly lighter for contrast
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
        body1: { fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' },
        button: { textTransform: 'none', fontWeight: 800 },
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

