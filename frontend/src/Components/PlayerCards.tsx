import React from 'react';
import { Box, Typography } from '@mui/material';

interface PlayerCardProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  points?: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ name, icon, points, color }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: color,
        color: "primary.contrastText",
        py: 1,
        px: 2,
      }}
    >

        {icon}
      <Box 
        sx={{ 
            width: '240px',
        }}>
        <Typography variant="h3" color="primary.contrastText">{name}</Typography>
      </Box>
      <Typography variant="h3" color="primary.contrastText">{points}</Typography>
    </Box>
  );
};

export default PlayerCard;