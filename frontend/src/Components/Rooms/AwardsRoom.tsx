import { useQuery } from '@apollo/client';
import { Alert, Box, Typography} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Emotion, Player } from '../../types';
import PlayerCard from '../PlayerCards';
import { GameState, useGameStore } from '../../stores/useGameStore';
import { calculatePoints, getFavoriteGags, getSuperlatives } from '../../utils/gameUtils';
import LoadingLogo from '../LoadingLogo';
import { GET_PLAYERS, GetPlayersData } from '../../graphql/queries/playerQueries';
import { useGameQuery } from '../../Hooks/useGameQuery';
import { SUPERLATIVES } from '../../themes/constants';
import AwardDisplay from '../AwardDisplay';
import AwardCard from '../AwardCard';
import KingCard from '../SuperlativeCards/KingCard';

const AwardRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const game = useGameStore((state: GameState) => state.game)
  const currentRound = useGameStore((state: GameState) => state.currentRound)
  const {totalLikeCounts, favoriteGags} = getFavoriteGags(game)
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [awardPlayer, setAwardPlayer] = useState<Player | null>(null)
  const [awardType, setAwardType] = useState("")

  useGameQuery(gameId, playerId, currentRound?._id)

  const { loading: loadingPlayers, error: errorPlayers } = useQuery<GetPlayersData>(GET_PLAYERS, {
    variables: { gameId, roundId: currentRound?._id },
    skip: !gameId,
    fetchPolicy: 'network-only',
    onCompleted(data) {
      if (!!data?.getPlayers) {
        setPlayerList(data.getPlayers);
      }
    },
  });

  const pointArray = useMemo(() => calculatePoints(game, favoriteGags || [], playerList), [game, favoriteGags, playerList]);
  const superlativesUnfiltered = useMemo(() => getSuperlatives(playerList), [playerList]);
  const superlatives = Object.entries(superlativesUnfiltered).filter(([key, playerId]) => playerId !== "")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % superlatives.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [superlatives.length]);

  useEffect (() => {
    const [currentKey, currentValue] = superlatives[currentIndex] || [];
    setAwardPlayer(playerList.find((p) => p._id === currentValue) || null)
    setAwardType(currentKey)
  }, [superlatives, currentIndex, setAwardPlayer, setAwardType, playerList])

  if (!game || loadingPlayers) return <LoadingLogo />;

  if (errorPlayers) {
    return <Alert severity="error">{errorPlayers.message}</Alert>
}

  const renderPlayerCards = () => {
    let tieScore = -1;
    return (
      pointArray.map((scoreEntry, index) => {
        const currPlayer = game?.players.find(p => p._id === scoreEntry.playerId);
        const points = scoreEntry.points;
        const n = pointArray.length
        if (index === 0 && n > 1 && pointArray[1].points === scoreEntry.points) tieScore = scoreEntry.points;
        let emotion = "neutral"
        if (scoreEntry.points !== tieScore) {
          if (index === 0) {
            emotion = "happy";
          } else if (index === n - 1) {
            emotion = "sad";
          } else if (index > Math.floor((n - 1) / 2)) {
            emotion = "nervous";
          }
        }

        return (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <PlayerCard 
                key={currPlayer?._id} 
                name={currPlayer?.name || ''}
                color={currPlayer?.color || ''}
                points={points}
                icon={currPlayer?.icon}
                emotion={emotion as Emotion}
              />
              { index === 0 && tieScore === -1 && (
                <Box 
                  sx={{ 
                  position: 'absolute', 
                  top: '-80px', 
                  right: '-13px', 
                  }}
              >
                  <img src={SUPERLATIVES.kingStill} alt="King" width={120} />
              </Box>
              )}
            </Box>
          );
      })
    );
  }

  const king = game?.players.find(p => p._id === pointArray[0]?.playerId);
  if (currentIndex === -1 && pointArray[0]?.points > pointArray[1]?.points && king) {
    return (
        <AwardCard title="THE WINNER IS" description={`WITH A WHOPPING ${pointArray[0]?.points} POINTS`}>
            <KingCard player={king} />
        </AwardCard>
    )
  }

  return (
    <Box textAlign="center" alignItems="center"  marginTop="8px" display="flex" flexDirection="column">
        <Box display="flex" justifyContent="center" flexWrap="wrap">
            {renderPlayerCards()}
        </Box>
        { awardPlayer && (
            <Box>
                <AwardDisplay player={awardPlayer} superlative={awardType} />
            </Box>
        )}
        {(favoriteGags?.length || 0) > 0 && (
            <Box marginTop="24px">
                <Typography color="text.secondary" variant='h4'>FAVORITE RESPONSES: </Typography>
            </Box>
        )}
        {favoriteGags?.map((gag) => {
            if (gag) {
                return (
                    <Box 
                        display="flex" 
                        key={`${gag?._id}-container`} 
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
                        <Typography color="secondary" textAlign="left"> {gag.text}</Typography>
                        <Box marginLeft="16px">
                            <Typography color="secondary" key={`${gag?._id}-votes`}>{totalLikeCounts[gag?._id]}</Typography>
                        </Box>
                    </Box>
                )
            } else {
                return null;
            }
        })}
    </Box>
  )
}
export default AwardRoom;