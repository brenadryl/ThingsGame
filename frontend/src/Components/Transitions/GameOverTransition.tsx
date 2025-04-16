import { Box, Typography } from '@mui/material';
import React from 'react';
import SlapDown from '../SlapDown';
import KingCard from '../SuperlativeCards/KingCard';
import { Player } from '../../types';

interface GameOverProps {
  player?: Player;
}

const GameOverTransition: React.FC<GameOverProps> = ({ player }) => {
  return (
    <Box textAlign="center" alignItems="center" display="flex" flexDirection="column">
        <SlapDown delay={0.3}>
            <Typography color="info" variant="h1" marginBottom="160px"> GAME OVER </Typography>
        </SlapDown>
       {player && <> 
            <SlapDown delay={1}>
                <Typography color="text.secondary" variant="h3"> AND THE WINNER IS </Typography>
            </SlapDown>
            <SlapDown delay={2}>
                <KingCard player={player} />
            </SlapDown>
        </>
        }
    </Box>
  );
};

export default GameOverTransition;