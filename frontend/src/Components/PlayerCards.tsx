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
  mini?: Boolean
  isStandard?: Boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ name, icon, points, color, emotion = "neutral", mini, isStandard = true }) => {
  const start = mini ? 50 : 70;
  const sub = isStandard ? 0 : mini ? 10 : 24;
  const size = start - sub;

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
          width: size + 10,
          height: size + 10,
          bgcolor: color,
          borderRadius: '20%',
        }}
      >
        { icon !== undefined && (<img src={AVATAR_LIST[icon][emotion]} key={`${name}-img`} alt={name} style={{ maxWidth: size, maxHeight: size, width: 'auto', height: 'auto' }} />) }
        
      </Box>
      <Box borderRadius="10px">
        <Typography variant="body1" color={color} sx={{textDecoration: color === "grey" ? "line-through" : undefined, textDecorationThickness: '2px',}}>{name}</Typography>
        <Typography variant="h3" color={color}>{points}</Typography>
      </Box>
    </Box>
  );
};

export default PlayerCard;


