import React from 'react';
import { Gag, Player } from '../types';
import { Drawer, Typography } from '@mui/material';
import { Box } from '@mui/system';
import PlayerSelection from './PlayerSelection';

interface PlayerDrawerProps {
    isDrawerOpen: boolean;
    playerList: Player[];
    gagList: Gag[];
    handleCloseDrawer: () => void;
    handlePlayerClick: (player: Player) => void;
}

const PlayerDrawer: React.FC<PlayerDrawerProps> = ({ isDrawerOpen, playerList, gagList, handleCloseDrawer, handlePlayerClick }) => {
  return (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={handleCloseDrawer}
      PaperProps={{
        sx: {
          width: 300,
          padding: 2
        }
      }}
    >
      <Box marginY="16px" textAlign="center">
        <Typography color="info" variant="h3">GUESS WHO SAID IT</Typography>
      </Box>
      <PlayerSelection playerList={playerList} gagList={gagList} onClick={handlePlayerClick}/>
    </Drawer>
  );
};

export default PlayerDrawer;



