import { Box } from "@mui/system";
import React from "react";
import { AVATAR_LIST } from "../../themes/constants";
import { Player } from "../../types";
import { CircularProgress, Typography } from "@mui/material";

interface BufferingCardProps {
  player: Player;
}

const BufferingCard: React.FC<BufferingCardProps> = ({ player }) => {
  return (
    <Box marginY="8px">
        <Box sx={{ position: 'relative', display: 'inline-block' }} marginY="12px">
            <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    padding="8px"
                    sx={{
                    width: 110,
                    height: 110,
                    bgcolor: player.color,
                    borderRadius: '20%',
                    }}
                >
                <img src={AVATAR_LIST[player.icon]["nervous"]} alt={player.name} style={{ maxWidth: 100, maxHeight: 100, width: 'auto', height: 'auto' }} />
            </Box>
            <Box 
                sx={{ 
                position: 'absolute', 
                top: '-20px', 
                right: '-10px', 
                }}
            >
                <CircularProgress color="secondary" />
            </Box>
        </Box>
        <Typography color="info" variant="h4">{player.name}</Typography>
    </Box>
  );
};

export default BufferingCard;