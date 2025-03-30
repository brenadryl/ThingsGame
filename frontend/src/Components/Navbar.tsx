import React from "react";
import { AppBar, Box, Toolbar } from "@mui/material";
import GradientButton from "./GradientButton";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import { darkTheme, lightTheme } from "../themes/theme";
import { LOGO } from "../themes/constants";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  return (
    <AppBar position="static">
      <Toolbar>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          paddingX="16px"
          paddingY="8px"
        >
          <img
            src={LOGO}
            alt="JOAKS ON YOU"
            style={{ maxHeight: "60px", width: "auto", height: "auto" }}
            onClick={() => navigate('/')}
          />
          <GradientButton
            onClick={toggleDarkMode}
            firstColor={darkMode ? darkTheme.palette.primary.main : lightTheme.palette.primary.main}
            secondColor={darkMode ? darkTheme.palette.secondary.main : lightTheme.palette.secondary.main}
            startIcon={darkMode ? <BedtimeIcon /> : undefined}
            endIcon={darkMode ? undefined : <WbSunnyIcon />}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;