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
import HostPage from './pages/HostPage';
import WaitingRoom from './pages/WaitingRoom';
import PlayRoom from './pages/PlayRoom';
import WritingRoom from './pages/WritingRoom';
import RoundRoom from './pages/RoundRoom';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>

      <CssBaseline enableColorScheme />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
          <Typography variant="h2" color="primary.contrastText" component="div" sx={{ flexGrow: 1 }}>
            JOAKS ON YOU
          </Typography>
          <GradientButton
            onClick={() => setDarkMode(!darkMode)}
            firstColor={darkMode ? darkTheme.palette.primary.main : lightTheme.palette.primary.main}
            secondColor={darkMode ? darkTheme.palette.secondary.main : lightTheme.palette.secondary.main}
            startIcon={darkMode ? <BedtimeIcon/> : undefined}
            endIcon={darkMode ? undefined : <WbSunnyIcon/>}
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
              path="/host"
              element={ <HostPage/>
              }
            />
            <Route
              path="/join"
              element={ <JoinPage/>
              }
            />
            <Route
              path="/waiting-room/:gameId/:playerId"
              element={ <WaitingRoom/>
              }
            />
            <Route
              path="/play-room/:gameId/:playerId"
              element={ <PlayRoom/>
              }
            />
            <Route
              path="/writing-room/:gameId/:playerId"
              element={ <WritingRoom/>
              }
            />
            <Route
              path="/round-room/:gameId/:playerId"
              element={ <RoundRoom/>
              }
            />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;