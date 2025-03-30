import React, { useState, useEffect, useMemo } from "react";
import { Box, CssBaseline, ThemeProvider, Container } from "@mui/material";
import Navbar from "./Components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { lightTheme, darkTheme } from "./themes/theme";

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("darkMode") === "true"; // Persist theme preference
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box sx={{ flexGrow: 1 }} marginBottom="64px">
        <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode((prev) => !prev)} />
        <Container maxWidth="sm">
          <AppRoutes />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;