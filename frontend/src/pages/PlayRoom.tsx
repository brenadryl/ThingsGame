import { useQuery } from '@apollo/client';
import { Alert, Box, CircularProgress, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Game, Player } from '../types';
import PlayerCard from '../Components/PlayerCards';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { FUN_ICONS } from '../themes/constants';


const PlayRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null)
  const [playerList, setPlayerList] = useState<Player[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading: loadingGame, error: errorGame, data: gameData, refetch } = useQuery<GetGameData>(GET_GAME, {
    variables: {id: gameId},
    skip: !gameId,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (gameId) {
      console.log("Refetching game data...");
      refetch();
    }
  })

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
    }
  }, [gameId, playerId, errorGame])

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if(loadingGame) {
    return <CircularProgress />
  }

  const currentTurnPlayer = playerList[(game?.rounds?.length || 0 % playerList.length)];

  return (
    <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
      <Typography color="info" variant="h3">{`Round ${game?.rounds.length || 0 + 1}`}</Typography>
      <Box textAlign="center" alignItems="center"  marginY="16px" >
        <Typography color="text.secondary">{currentTurnPlayer?.name + " is choosing a prompt"}</Typography>
      </Box>
      {playerList.map((currPlayer) => (
        <PlayerCard key={currPlayer._id} name={currPlayer?.name || ''} icon={FUN_ICONS[currPlayer.icon || 0]} color={currPlayer.color || ''}/>
      ))}
    </Box>
  )
}
export default PlayRoom;