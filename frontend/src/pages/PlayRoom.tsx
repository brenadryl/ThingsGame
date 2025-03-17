import { useQuery, useSubscription } from '@apollo/client';
import { Alert, Box, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Game, Player } from '../types';
import PlayerCard from '../Components/PlayerCards';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import PromptSelection from '../Components/PromptSelection';
import { NEW_ROUND_SUBSCRIPTION } from '../graphql/subscriptions/roundSubscriptions';
import LoadingLogo from '../Components/LoadingLogo';
import useDirector from '../Hooks/useDirector';


const PlayRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  useDirector(gameId, playerId, "play")
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null)
  const [playerList, setPlayerList] = useState<Player[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading: loadingGame, error: errorGame, data: gameData, refetch } = useQuery<GetGameData>(GET_GAME, {
    variables: {id: gameId},
    skip: !gameId,
    fetchPolicy: "network-only",
  });
  useSubscription(NEW_ROUND_SUBSCRIPTION, {
      variables: {gameId},
      onSubscriptionData: ({subscriptionData}) => {
        const round = subscriptionData?.data?.newRound;
        if (round?._id) {
          console.log("Round started! Navigating to Writing Room...")
          navigate(`/writing-room/${gameId}/${playerId}`)
        }
      }
    })

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
      if (gameData.getGame.currentRound && gameData.getGame.currentRound.stage !== 2) {
        navigate(`/writing-room/${gameData.getGame._id}/${playerId}`)
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
    return <LoadingLogo />
  }

  const currentTurn = ((game?.rounds?.length || 0) % (playerList.length));
  const currentTurnPlayer = playerList[currentTurn];
  const currentRound = game?.rounds.length || 0 + 1;

  if (currentTurnPlayer?._id === playerId) {
    return <PromptSelection gameId={gameId || ''} turn={currentTurn}/>
  }

  return (
    <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
      <Typography color="info" variant="h3">{`Round ${currentRound}`}</Typography>
      <Box textAlign="center" alignItems="center"  marginY="16px" >
        <Typography color="text.secondary">{currentTurnPlayer?.name + " is choosing a prompt"}</Typography>
      </Box>
      <Box display="flex" justifyContent="center" flexWrap="wrap">
        {playerList.map((currPlayer) => (
          <PlayerCard key={currPlayer._id} name={currPlayer?.name || ''} color={currPlayer.color || ''} icon={currPlayer.icon}/>
        ))}
      </Box>
    </Box>
  )
}
export default PlayRoom;