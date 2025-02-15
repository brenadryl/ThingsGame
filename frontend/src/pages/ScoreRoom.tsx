import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Gag, Game, Player } from '../types';
import { useSubscription } from '@apollo/client';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { CHANGE_GAME_MUTATION } from '../graphql/mutations/gameMutations';
import { GAME_STAGE_SUBSCRIPTION } from '../graphql/subscriptions/gameSubscriptions';
import PlayerCard from '../Components/PlayerCards';
import { FUN_ICONS } from '../themes/constants';


const ScoreRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null)
  const [favoriteGags, setFavoriteGags] = useState<(Gag | null)[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading: loadingGame, error: errorGame, data: gameData } = useQuery<GetGameData>(GET_GAME, {
    variables: {id: gameId},
    skip: !gameId,
    fetchPolicy: "network-only",
  });
  const [updateGame, {loading: updateGameLoading, error: updateGameError}] = useMutation(CHANGE_GAME_MUTATION);
  useSubscription(GAME_STAGE_SUBSCRIPTION, {
    variables: {gameId},
    onSubscriptionData: ({subscriptionData}) => {
      const updatedGame = subscriptionData?.data?.gameStageChange;
      console.log("game subscription state change! ", updatedGame)
      if (updatedGame.stage === 2) {
        console.log("New Round! Navigating to PlayRoom...")
        navigate(`/play-room/${gameId}/${playerId}`)
      }
    }
  })

  useEffect(() => {
    console.log(gameData)
    if(gameData?.getGame) {
      setGame(gameData.getGame)
      console.log("SCORE GAME  ", gameData.getGame)
      const faves = gameData.getGame.rounds.map((round) => {
        if (!round.gags || round.gags.length === 0) return null;
        const maxVotes = Math.max(...round.gags.map(gag => gag.votes))
        const topGags = round.gags.filter(gag => gag.votes === maxVotes)
        return topGags.length === 1 ? topGags[0] : null;
      }).filter((gag) => gag !== null)
      if (faves) {
        setFavoriteGags(faves);
      }
      const currentPlayer = gameData.getGame.players.find(p => p._id === playerId) || null;
      if(!currentPlayer) {
        setErrorMessage("You are not a part of this game")
        console.log("You are not a part of this game")
        setTimeout(() => navigate('/'), 5000); // Redirect after 3 seconds
      }
      if (gameData.getGame.stage === 1) {
        navigate(`/waiting-room/${gameData.getGame._id}/${playerId}`)
      } else if (gameData.getGame.stage === 2) {
        navigate(`/play-room/${gameData.getGame._id}/${playerId}`)
      }
    }
  }, [gameData, playerId, navigate])

  useEffect(() => {
    if (!gameId || !playerId) {
      setErrorMessage("Invalid Game ID or Player ID")
    } else if (errorGame) {
      setErrorMessage("Error fetching game data: " + errorGame.message)
    }
  }, [gameId, playerId, errorGame])

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

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if(loadingGame) {
    return <CircularProgress />
  }
  const calculatePoints = (player: Player) => {
    let points = 0;
    if (player.guessesMade) {
        points += player.guessesMade.filter((guess) => guess.isCorrect).length || 0;
    }
    points += favoriteGags.filter((gag) => gag?.player._id === player._id).length || 0;
    return points;
  }
  console.log("favorite gags", favoriteGags)

  return (
    <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
      <Box textAlign="center" alignItems="center"  marginBottom="32px" display="flex" flexDirection="row">
        <Typography color="text.secondary" variant="h3">SCOREBOARD</Typography>
      </Box>
      {game?.players.map((currPlayer) => (
            <PlayerCard 
                key={currPlayer._id} 
                name={currPlayer?.name || ''} 
                icon={FUN_ICONS[currPlayer.icon || 0]} 
                color={currPlayer.color || ''}
                points={calculatePoints(currPlayer)}
            />
        ))}
        {favoriteGags.length > 0 && (
            <Box marginTop="24px">
                <Typography color="text.secondary" variant='h4'>FAVORITE RESPONSES: </Typography>
            </Box>
        )}
        {favoriteGags.map((gag) => {
            if (gag) {
                return (
                    <Box 
                        display="flex" 
                        key={`${gag?._id}-container`} 
                        marginY="8px"
                        justifyContent="space-between"
                        minWidth="320px"
                        padding="8px" 
                        sx={{
                            border: 1,
                            borderColor: "secondary.main",
                            borderRadius: 1,
                        }}
                    >
                        <Typography color="secondary" key={`${gag?._id}-gag`}> {gag.text}</Typography>
                        <Box marginLeft="16px">
                            <Typography color="secondary" key={`${gag?._id}-votes`}>{gag.votes}</Typography>
                        </Box>
                    </Box>
                )
            } else {
                return null;
            }
        })}
      {game?.players?.[0]?._id === playerId && (
        <Button onClick={handleUpdateGame} variant='contained' disabled={updateGameLoading} sx={{marginTop: '24px'}}>
          {updateGameLoading ? <CircularProgress size={24}/> : "START NEXT ROUND"}
        </Button>
      )}
      {updateGameError && <Alert severity="error">Error starting game: {updateGameError.message}</Alert>}
    </Box>
  )
}
export default ScoreRoom;