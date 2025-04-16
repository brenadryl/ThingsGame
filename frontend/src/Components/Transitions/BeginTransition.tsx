import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { GameState, useGameStore } from '../../stores/useGameStore';
import SlapDown from '../SlapDown';

const BeginTransition: React.FC = () => {
  const setRoom = useGameStore((state: GameState) => state.setRoom);

  useEffect(() => {
    const delay = 4;
    const timeoutId = setTimeout(() => {
      setRoom("play");
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [setRoom]);

  return (
    <Box textAlign="center" alignItems="center" display="flex" flexDirection="column">
        <SlapDown delay={0.3}>
            <Typography color="info" variant="h2" marginBottom="160px"> STARTING </Typography>
        </SlapDown>
        <SlapDown>
            <Typography color="text.secondary" variant="h3"> LET THE GAMES BEGIN! </Typography>
        </SlapDown>
    </Box>
  );
};

export default BeginTransition;