import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { GameState, useGameStore } from '../../stores/useGameStore';
import SlapDown from '../SlapDown';

const WritingTransition: React.FC = () => {
  const setRoom = useGameStore((state: GameState) => state.setRoom);
  const currentRound = useGameStore((state: GameState) => state.currentRound);

  useEffect(() => {
    const delay = 4.3;
    const timeoutId = setTimeout(() => {
      setRoom("writing");
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [ setRoom]);

  return (
    <Box textAlign="center" alignItems="center" marginTop="80px" display="flex" flexDirection="column">
        <SlapDown delay={0.6}>
            <Typography color="text.secondary" variant="h3"> THE PROMPT IS </Typography>
        </SlapDown>
        <SlapDown>
            <Typography color="secondary" variant="h2" marginX="24px"> {currentRound?.promptText} </Typography>
        </SlapDown>
        <SlapDown delay={3.3}>
            <Typography color="text.secondary" variant="h3"> START WRITING! </Typography>
        </SlapDown>
    </Box>
  );
};

export default WritingTransition;