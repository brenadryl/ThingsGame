import { useQuery } from '@apollo/client';
import { Alert, Box, CircularProgress, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Game, Player } from '../types';
import PlayerCard from '../Components/PlayerCards';
import { useSubscription } from '@apollo/client';
import { NEW_PLAYER_SUBSCRIPTION } from '../graphql/subscriptions/newPlayer';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { FUN_ICONS } from '../themes/constants';


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
  const { error: errorSubscription } = useSubscription(NEW_PLAYER_SUBSCRIPTION, {
    variables: { gameId },
    onSubscriptionData: ({ subscriptionData }) => {
      try {
        if (subscriptionData?.data?.newPlayer) {
          console.log("Subscription received new player data:", subscriptionData.data.newPlayer);
          const updatedPlayers = subscriptionData.data.newPlayer;
          if (Array.isArray(updatedPlayers)) {
            setPlayerList(subscriptionData.data.newPlayer);
          } else {
            console.warn("Subscription returned unexpected data format");
          }
        } else {
          console.warn("Subscription did not return expected data.");
        }
      } catch (err) {
        console.error("Error processing subscription data:", err);
        setErrorMessage("Error processing player updates.");
      }
    }
  });

  useEffect(() => {
    console.log(gameData)
    if(gameData?.getGame) {
      setGame(gameData.getGame)
      setPlayerList(gameData.getGame.players || [])
      const currentPlayer = gameData.getGame.players.find(p => p._id === playerId) || null;
      if(!currentPlayer) {
        setErrorMessage("You are not a part of this game")
        console.log("You are not a part of this game")
        setTimeout(() => navigate('/'), 5000); // Redirect after 3 seconds
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
      {playerList.map((currPlayer) => (
        <PlayerCard key={currPlayer._id} name={currPlayer?.name || ''} icon={FUN_ICONS[currPlayer.icon || 0]} color={currPlayer.color || ''}/>
      ))}
    </Box>
  )
}
export default WaitingRoom;