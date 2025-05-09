import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { GameState, useGameStore } from '../../stores/useGameStore';
import SlapDown from '../SlapDown';

const SubmittedTransition: React.FC = () => {
  const setRoom = useGameStore((state: GameState) => state.setRoom);

  useEffect(() => {
    const delay = 4;
    const timeoutId = setTimeout(() => {
      setRoom("guessing");
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [setRoom]);

  return (
    <Box textAlign="center" alignItems="center" marginTop="100px" display="flex" flexDirection="column">
        <SlapDown delay={1}>
            <Typography color="secondary" variant="h1" marginBottom="24px"> ALL RESPONSES IN </Typography>
        </SlapDown>
        <SlapDown>
            <Typography color="text.secondary" variant="h3"> BEGIN GUESSING </Typography>
        </SlapDown>
    </Box>
  );
};

export default SubmittedTransition;