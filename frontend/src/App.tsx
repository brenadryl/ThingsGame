import React, { useState } from 'react';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import TestPage from './pages/TestPage';
import HomePage from './pages/HomePage';
import { AppBar, Box, CssBaseline, ThemeProvider, Toolbar, Typography } from "@mui/material";
import { lightTheme, darkTheme } from "./themes/theme";
import GradientButton from './Components/GradientButton';
import { Container } from '@mui/system';
import JoinPage from './pages/JoinPage';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>

      <CssBaseline enableColorScheme />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
          <Typography variant="h5" color="background" component="div" sx={{ flexGrow: 1 }}>
            Oaks Things
          </Typography>
          <GradientButton
            onClick={() => setDarkMode(!darkMode)}
            firstColor={darkMode ? darkTheme.palette.primary.main : lightTheme.palette.primary.main}
            secondColor={darkMode ? darkTheme.palette.secondary.main : lightTheme.palette.secondary.main}
            startIcon={darkMode ? <WbSunnyIcon/> : undefined}
            endIcon={darkMode ? undefined : <BedtimeIcon/>}
          />
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm">
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route
              path="/"
              element={ <HomePage/>
              }
            />
            <Route
              path="/join"
              element={ <JoinPage/>
              }
            />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;