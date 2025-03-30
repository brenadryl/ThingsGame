import React from 'react';
import { Player } from '../types';
import { Drawer, Typography } from '@mui/material';
import { Box } from '@mui/system';
import PlayerSelection from './PlayerSelection';
import { useGameStore } from '../stores/useGameStore';
import { shallowEqual } from '../utils/gameUtils';

interface PlayerDrawerProps {
    players: Player[];
    isDrawerOpen: boolean;
    handleCloseDrawer: () => void;
    handlePlayerClick: (player: Player) => void;
}

const PlayerDrawer: React.FC<PlayerDrawerProps> = ({ isDrawerOpen, handleCloseDrawer, handlePlayerClick, players }) => {
  const gagList = useGameStore((state) => state.gagList)

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
      <PlayerSelection playerList={players} gagList={gagList} onClick={handlePlayerClick}/>
    </Drawer>
  );
};

export default React.memo(PlayerDrawer, (prev, next) => {
  return (
    prev.isDrawerOpen === next.isDrawerOpen &&
    shallowEqual(prev.players, next.players)
  );
});



