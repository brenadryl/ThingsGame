import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import JoinPage from "../pages/JoinPage";
import HostPage from "../pages/HostPage";
import GamePage from "../pages/GamePage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/host" element={<HostPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/game/:gameId/:playerId" element={<GamePage />} />
    </Routes>
  );
};

export default AppRoutes;