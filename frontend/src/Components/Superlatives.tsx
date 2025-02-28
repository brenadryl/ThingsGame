import React from 'react';
import { Emotion, Player } from '../types';
import PlayerCard from './PlayerCards';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';

interface SuperlativeCardProps {
  player: Player;
  superlative: string;
  description: string;
  emotion: Emotion;
}

const SuperlativeCard: React.FC<SuperlativeCardProps> = ({ player, superlative, description, emotion }) => {
  return ( 
    <Box margin="8px" borderRadius={3} sx={{ border:'2px solid', borderColor: "info.main",}}>
        <Box display="flex" flexDirection="column" width="150px" height="80px" justifyContent="center">
            <Typography variant="h5" color="info.main">{superlative.toUpperCase()}</Typography>
            <Typography variant="body2" color="info.main">{description.toUpperCase()}</Typography>
        </Box>
        <PlayerCard key={player._id} name={player?.name || ''} color={player.color || ''} icon={player.icon} emotion={emotion}/>
    </Box>
  );
};

export default SuperlativeCard;



