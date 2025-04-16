import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { AVATAR_LIST, SUPERLATIVES } from "../../themes/constants";
import { Player } from "../../types";
import { Typography } from "@mui/material";
import SlapDown from "../SlapDown";

interface SecretAgentCardProps {
    player: Player;
}

const SecretAgentCard: React.FC<SecretAgentCardProps> = ({ player }) => {
    const [isDisplayed, setIsDisplayed] = useState(false)
    useEffect(() => {
        const timer = setInterval(() => {
            setIsDisplayed(true)
        }, 3500);
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
                <img src={AVATAR_LIST[player.icon][isDisplayed ? "happy" : "neutral"]} alt={player.name} style={{ maxWidth: 100, maxHeight: 100, width: 'auto', height: 'auto' }} />
            </Box>
            <Box 
                sx={{ 
                position: 'absolute', 
                top: '-55px', 
                right: '-55px', 
                transform: 'rotate(35deg)'
                }}
            >
                {isDisplayed && <img src={SUPERLATIVES.agent} alt="SecretAgent" width={120} />}
            </Box>
        </Box>
        {!isDisplayed && <Typography color="secondary" variant="h4">{`AN ORDINARY ${AVATAR_LIST[player.icon].name.toUpperCase()}???`}</Typography>}
        <SlapDown delay={3.9}> <Typography color="info" variant="h4">{`${player.name} THE ${AVATAR_LIST[player.icon].name.toUpperCase()}!!!`}</Typography> </SlapDown> 
    </Box>
  );
};

export default SecretAgentCard;