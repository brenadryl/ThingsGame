import React from 'react';
import { Box, Typography } from '@mui/material';
import { AVATAR_LIST } from '../themes/constants';
import { Emotion } from '../types';

interface PlayerCardProps {
  name: string;
  icon?: number;
  color: string;
  points?: number;
  happy?: Boolean;
  emotion?: Emotion;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ name, icon, points, color, emotion = "neutral" }) => {
  console.log(`${name} ${icon}`)
  console.log(AVATAR_LIST[icon || 0].happy)
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        color: "primary.contrastText",
        py: 1,
        px: 1,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding="8px"
        sx={{
          width: 80,
          height: 80,
          bgcolor: color,
          borderRadius: '20%',
        }}
      >
        { icon !== undefined && (<img src={AVATAR_LIST[icon][emotion]} key={`${name}-img`} alt={name}     style={{ maxWidth: '70px', maxHeight: '70px', width: 'auto', height: 'auto' }} />) }
        
      </Box>
      <Box borderRadius="10px">
        <Typography variant="h4" color={color}>{name}</Typography>
        <Typography variant="h3" color="primary.contrastText">{points}</Typography>
      </Box>
    </Box>
  );
};

export default PlayerCard;


