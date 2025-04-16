import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { AVATAR_LIST, SUPERLATIVES } from "../../themes/constants";
import { Player } from "../../types";
import { Typography } from "@mui/material";

interface DetectiveCardProps {
  player: Player;
}

const DetectiveCard: React.FC<DetectiveCardProps> = ({ player }) => {
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
                    <img src={AVATAR_LIST[player.icon]["suspicious"]} alt={player.name} style={{ maxWidth: 100, maxHeight: 100, width: 'auto', height: 'auto' }} />
                </Box>
                <Box 
                    sx={{ 
                    position: 'absolute', 
                    top: '-40px', 
                    right: '-55px', 
                    }}
                >
                    { isDisplayed && 
                    <img src={SUPERLATIVES.detective} alt="detective-glass" width={150} />
                    }
                </Box>
            </Box>
        <Typography color="info" variant="h4">{player.name}</Typography>
    </Box>
    );
};

export default DetectiveCard;