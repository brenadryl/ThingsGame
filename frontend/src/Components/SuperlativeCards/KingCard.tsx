import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { AVATAR_LIST, SUPERLATIVES } from "../../themes/constants";
import { Player } from "../../types";
import { Typography } from "@mui/material";

interface KingCardProps {
    player: Player;
}

const KingCard: React.FC<KingCardProps> = ({ player }) => {
    const [isDisplayed, setIsDisplayed] = useState(false)
    useEffect(() => {
        const timer = setInterval(() => {
            setIsDisplayed(true)
        }, 2000);
        return () => clearInterval(timer);
    }, []);
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
                <img src={AVATAR_LIST[player.icon]["happy"]} alt={player.name} style={{ maxWidth: 100, maxHeight: 100, width: 'auto', height: 'auto' }} />
            </Box>
            <Box 
                sx={{ 
                position: 'absolute', 
                top: '-80px', 
                right: '-5px', 
                }}
            >
                { isDisplayed && 
                <img src={SUPERLATIVES.king} alt="King" width={120} />
                }
            </Box>
        </Box>
        <Typography color="info" variant="h4">{player.name}</Typography>
    </Box>
  );
};

export default KingCard;