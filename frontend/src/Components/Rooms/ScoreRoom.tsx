import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Typography} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Emotion, Player } from '../../types';
import { CHANGE_GAME_MUTATION } from '../../graphql/mutations/gameMutations';
import PlayerCard from '../PlayerCards';
import { GameState, useGameStore } from '../../stores/useGameStore';
import { calculatePoints, getFavoriteGags } from '../../utils/gameUtils';
import LoadingLogo from '../LoadingLogo';
import { GET_PLAYERS, GetPlayersData } from '../../graphql/queries/playerQueries';
import { useGameQuery } from '../../Hooks/useGameQuery';
import { SUPERLATIVES } from '../../themes/constants';
import GameMenu from '../GameMenu';

const ScoreRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const game = useGameStore((state: GameState) => state.game)
  const currentRound = useGameStore((state: GameState) => state.currentRound)
  const [updateGame, {loading: updateGameLoading, error: updateGameError}] = useMutation(CHANGE_GAME_MUTATION);
  const {totalLikeCounts, favoriteGags} = getFavoriteGags(game)
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

  if (errorMessage || errorPlayers) {
    return <Alert severity="error">{errorMessage}</Alert>
  }
  if (!game || loadingPlayers) return <LoadingLogo />;

  const handleUpdateGame = async () => {
    if (!gameId) return;
    try {
      await updateGame({variables: { id: gameId, active: true, stage: 2 }})
      console.log("Next Round!")
    } catch (error) {
      console.error("Error starting next round:", error)
      setErrorMessage("Failed to start next round.");
    }
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

  return (
    <Box textAlign="center" alignItems="center" display="flex" flexDirection="column">
      { playerId !== "spectator" ? <Box position="relative" width="100%" display="flex" alignItems="center">
        <Typography
          variant="h3"
          color="info.main"
          sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
        >
          SCOREBOARD
        </Typography>
        <Box sx={{ marginLeft: 'auto' }}>
          <GameMenu />
        </Box>
      </Box> :
      <Box>
        <Typography
          variant="h3"
          color="info.main"
        >
          SCOREBOARD
        </Typography>
        <Typography variant="body1" > SPECTATOR VIEW </Typography>
      </Box>
      }
      <Box display="flex" justifyContent="center" flexWrap="wrap" marginTop="8px">
        {renderPlayerCards()}
      </Box>
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


      {game && game.players.length > 0 && game.players?.[0]?._id === playerId && game.active && (
        <Button onClick={handleUpdateGame} variant='contained' disabled={updateGameLoading} sx={{marginTop: '24px'}}>
          {updateGameLoading ? <CircularProgress size={24}/> : "START NEXT ROUND"}
        </Button>
      )}
      {updateGameError && <Alert severity="error">Error starting game: {updateGameError.message}</Alert>}
    </Box>
  )
}
export default ScoreRoom;