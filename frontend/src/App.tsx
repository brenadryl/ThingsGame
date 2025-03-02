import React, { useState } from 'react';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { AppBar, Box, CssBaseline, ThemeProvider, Toolbar } from "@mui/material";
import { lightTheme, darkTheme } from "./themes/theme";
import GradientButton from './Components/GradientButton';
import { Container } from '@mui/system';
import JoinPage from './pages/JoinPage';
import HostPage from './pages/HostPage';
import WaitingRoom from './pages/WaitingRoom';
import PlayRoom from './pages/PlayRoom';
import WritingRoom from './pages/WritingRoom';
import ScoreRoom from './pages/ScoreRoom';
import { LOGO } from './themes/constants';
import SubmittedRoom from './pages/SubmittedRoom';
import GuessingRoom from './pages/GuessingRoom';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>

      <CssBaseline enableColorScheme />
      <Box sx={{ flexGrow: 1 }} marginBottom="64px">
        <AppBar position="static">
          <Toolbar>
            <Box display="flex" alignContent="center" justifyContent="space-between" width="100%" alignItems="center" paddingX="16px" paddingY="8px">
              <img src={LOGO}  alt="JOAKS ON YOU" style={{ maxHeight: '60px', width: 'auto', height: 'auto' }} />
              <GradientButton
                onClick={() => setDarkMode(!darkMode)}
                firstColor={darkMode ? darkTheme.palette.primary.main : lightTheme.palette.primary.main}
                secondColor={darkMode ? darkTheme.palette.secondary.main : lightTheme.palette.secondary.main}
                startIcon={darkMode ? <BedtimeIcon/> : undefined}
                endIcon={darkMode ? undefined : <WbSunnyIcon/>}
              />
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm">
          <Routes>
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
              path="/submitted-room/:gameId/:playerId"
              element={ <SubmittedRoom/>
              }
            />
            <Route
              path="/guessing-room/:gameId/:playerId"
              element={ <GuessingRoom/>
              }
            />
            <Route
              path="/score-room/:gameId/:playerId"
              element={ <ScoreRoom/>
              }
            />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;