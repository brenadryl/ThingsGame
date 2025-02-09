import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Game, Player } from '../types';
import { useSubscription } from '@apollo/client';
import { NEW_PLAYER_SUBSCRIPTION } from '../graphql/subscriptions/playerSubscriptions';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { CHANGE_GAME_MUTATION } from '../graphql/mutations/gameMutations';
import { GAME_STAGE_SUBSCRIPTION } from '../graphql/subscriptions/gameSubscriptions';
import PlayerList from '../Components/PlayerList';


const WaitingRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null)
  const [playerList, setPlayerList] = useState<Player[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading: loadingGame, error: errorGame, data: gameData } = useQuery<GetGameData>(GET_GAME, {
    variables: {id: gameId},
    skip: !gameId,
  });
  const [startGame, {loading: startLoading, error: startError}] = useMutation(CHANGE_GAME_MUTATION);

  const { error: errorSubscription } = useSubscription(NEW_PLAYER_SUBSCRIPTION, {
    variables: { gameId },
    onSubscriptionData: ({subscriptionData}) => {
      console.log("subscriptionData",subscriptionData )
      try {
        if (subscriptionData?.data?.newPlayer) {
          console.log("Subscription received new player data:", subscriptionData.data?.newPlayer);
          const updatedPlayers = subscriptionData.data?.newPlayer;
          setPlayerList(updatedPlayers)
        } else {
          console.warn("Subscription did not return expected data.");
        }
      } catch (err) {
        console.error("Error processing subscription data:", err);
        setErrorMessage("Error processing player updates.");
      }
      console.log("Playerlist: ", playerList)
    }
  });
  useSubscription(GAME_STAGE_SUBSCRIPTION, {
    variables: {gameId},
    onSubscriptionData: ({subscriptionData}) => {
      const updatedGame = subscriptionData?.data?.gameStageChange;
      if (updatedGame.stage === 2) {
        console.log("Game started! Navigating to PlayRoom...")
        navigate(`/play-room/${gameId}/${playerId}`)
      }
    }
  })

  useEffect(() => {
    console.log(gameData)
    if(gameData?.getGame) {
      setGame(gameData.getGame)
      if (playerList.length < 1) {
        setPlayerList(gameData.getGame.players)
      }
      const currentPlayer = gameData.getGame.players.find(p => p._id === playerId) || null;
      if(!currentPlayer) {
        setErrorMessage("You are not a part of this game")
        console.log("You are not a part of this game")
        setTimeout(() => navigate('/'), 5000); // Redirect after 3 seconds
      }
      if (gameData.getGame.stage !== 1) {
        navigate(`/play-room/${gameData.getGame._id}/${playerId}`)
      }
    }
  }, [gameData, playerId, navigate])

  useEffect(() => {
    if (!gameId || !playerId) {
      setErrorMessage("Invalid Game ID or Player ID")
    } else if (errorGame) {
      setErrorMessage("Error fetching game data: " + errorGame.message)
    } else if (errorSubscription) {
      setErrorMessage("Error fetching players: " + errorSubscription.message)
    }
  }, [gameId, playerId, errorGame, errorSubscription])

  const handleStartGame = async () => {
    if (!gameId) return;
    try {
      await startGame({variables: { id: gameId, active: true, stage: 2 }})
      console.log("Game started!")
    } catch (error) {
      console.error("Error starting game:", error)
      setErrorMessage("Failed to start game.");
    }
  }

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if(loadingGame) {
    return <CircularProgress />
  }

  return (
    <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
      <Box textAlign="center" alignItems="center"  marginBottom="32px" display="flex" flexDirection="row">
        <Typography color="text.secondary">Game Code:</Typography>
        <Typography color="info" variant="h3">{game?.gameCode}</Typography>
      </Box>
      <PlayerList playerList={playerList}/>
      {game?.players?.[0]?._id === playerId && (
        <Button onClick={handleStartGame} variant='contained' disabled={startLoading} sx={{marginTop: '24px'}}>
          {startLoading ? <CircularProgress size={24}/> : "Start Game"}
        </Button>
      )}
      {startError && <Alert severity="error">Error starting game: {startError.message}</Alert>}
    </Box>
  )
}
export default WaitingRoom;