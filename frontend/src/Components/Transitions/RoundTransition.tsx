import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { GameState, useGameStore } from '../../stores/useGameStore';
import SlapDown from '../SlapDown';
import PlayerCard from '../PlayerCards';
import { Gag } from '../../types';

const RoundTransition: React.FC = () => {
  const gagList = useGameStore((state: GameState) => state.gagList);
  const guessList = useGameStore((state: GameState) => state.guessList);
  const playerList = useGameStore((state: GameState) => state.playerList);
  const setRoom = useGameStore((state: GameState) => state.setRoom);
  const loneSurvivor = guessList[0].guesser
  const loneSurvivorGag = gagList.find((g) => g.player._id === loneSurvivor._id)

  const findGagWithHighestVotes = (gagList: Gag[]): Gag | null => {
    if (!gagList || gagList.length === 0) return null;
    const maxVotes = Math.max(...gagList.map(gag => gag.votes));
    const topGags = gagList.filter(gag => gag.votes === maxVotes);
    return topGags.length === 1 ? topGags[0] : null;
  };
  
  const highestVotedGag = findGagWithHighestVotes(gagList);
  console.log("highest gag", highestVotedGag)
  const highestPlayer = playerList.find((p) => p._id === highestVotedGag?.player._id)

  useEffect(() => {
    const delay = 6;
    const timeoutId = setTimeout(() => {
      setRoom("score");
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [setRoom]);

  return (
    <Box textAlign="center" alignItems="center" display="flex" flexDirection="column">
        <SlapDown delay={0.2}>
            <Typography color="info" variant="h2" marginBottom="24px"> OVER </Typography>
        </SlapDown>
        <SlapDown delay={0.8}>
            <Typography color="text.secondary" variant="h3"> LONE SURVIVOR: </Typography>
        </SlapDown>

        <SlapDown>
            <Box 
                display="flex" 
                key={`${loneSurvivorGag?._id}-container`} 
                marginY="8px"
                justifyContent="space-between"
                width="320px"
                alignItems="center"
                padding="8px" 
                sx={{
                    border: 1,
                    borderColor: "secondary.main",
                    borderRadius: 1,
                }}
            >
                <Typography color="secondary" textAlign="left"> {loneSurvivorGag?.text}</Typography>
                <Box marginLeft="16px">
                    <Typography color="secondary" key={`${loneSurvivorGag?._id}-votes`}>{loneSurvivorGag?.votes}</Typography>
                </Box>
            </Box>
        </SlapDown>
        
        <Box display="flex" flexDirection="row" alignItems="start">
            <SlapDown>
                <PlayerCard 
                key={loneSurvivor?._id} 
                name={loneSurvivor?.name || ''}
                color={loneSurvivor?.color || ''}
                icon={loneSurvivor?.icon}
                emotion={"happy"}
                />
            </SlapDown>
            <SlapDown delay={2.1}>
                <Typography color="text.secondary" variant="h1"> +1</Typography>
            </SlapDown>
        </Box>
        {!!highestVotedGag && (
            <Box justifyItems="center">
                <SlapDown delay={2.7}>
                    <Typography color="text.secondary" variant="h3"> FAVORITE RESPONSE: </Typography>
                </SlapDown>

                <SlapDown delay={3.3}>
                    <Box 
                        display="flex" 
                        key={`${highestVotedGag?._id}-container`} 
                        marginY="8px"
                        justifyContent="space-between"
                        width="320px"
                        alignItems="center"
                        padding="8px" 
                        sx={{
                            border: 1,
                            borderColor: "secondary.main",
                            borderRadius: 1,
                        }}
                    >
                        <Typography color="secondary" textAlign="left"> {highestVotedGag.text}</Typography>
                        <Box marginLeft="16px">
                            <Typography color="secondary" key={`${highestVotedGag?._id}-votes`}>{highestVotedGag.votes}</Typography>
                        </Box>
                    </Box>
                </SlapDown>
                
                <Box display="flex" flexDirection="row" alignItems="start" textAlign="center">
                    <SlapDown delay={3.3}>
                        <PlayerCard 
                        key={highestPlayer?._id} 
                        name={highestPlayer?.name || ''}
                        color={highestPlayer?.color || ''}
                        icon={highestPlayer?.icon}
                        emotion={"happy"}
                        />
                    </SlapDown>
                    <SlapDown delay={3.9}>
                        <Typography color="text.secondary" variant="h1"> +1</Typography>
                    </SlapDown>
                </Box>
            </Box>
        )}
    </Box>
  );
};

export default RoundTransition;