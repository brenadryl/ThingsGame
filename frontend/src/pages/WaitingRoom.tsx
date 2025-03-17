import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Switch, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Game, Player } from '../types';
import { useSubscription } from '@apollo/client';
import { NEW_PLAYER_SUBSCRIPTION } from '../graphql/subscriptions/playerSubscriptions';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { CHANGE_GAME_MUTATION } from '../graphql/mutations/gameMutations';
import { GAME_STAGE_SUBSCRIPTION } from '../graphql/subscriptions/gameSubscriptions';
import PlayerList from '../Components/PlayerList';
import AvatarSelection from '../Components/AvatarSelection';
import { AVATAR_SELECTION_SUBSCRIPTION } from '../graphql/subscriptions/playerSubscriptions';
import LoadingLogo from '../Components/LoadingLogo';
import useDirector from '../Hooks/useDirector';


const WaitingRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  useDirector(gameId, playerId, "waiting")
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [playerList, setPlayerList] = useState<Player[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState("easy");
  const { loading: loadingGame, error: errorGame, data: gameData } = useQuery<GetGameData>(GET_GAME, {
    variables: {id: gameId},
    skip: !gameId,
    fetchPolicy: "network-only",
  });
  const [startGame, {loading: startLoading, error: startError}] = useMutation(CHANGE_GAME_MUTATION);

  const { error: errorAvatar } = useSubscription(AVATAR_SELECTION_SUBSCRIPTION, {
    variables: { gameId },
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data?.avatarSelected) {
        const updatedPlayers = subscriptionData.data.avatarSelected;
        setPlayerList(updatedPlayers);
        console.log("updatePlayers", updatedPlayers)
      }
    },
  });

  useEffect (() => {
    if (errorAvatar) {
      setErrorMessage(errorAvatar.message)
    }
  }, [errorAvatar])

  const { error: errorSubscription } = useSubscription(NEW_PLAYER_SUBSCRIPTION, {
    variables: { gameId },
    onSubscriptionData: ({subscriptionData}) => {
      try {
        if (subscriptionData?.data?.newPlayer) {
          const updatedPlayers = subscriptionData.data?.newPlayer;
          setPlayerList(updatedPlayers)
        } else {
          console.warn("Subscription did not return expected data.");
        }
      } catch (err) {
        console.error("Error processing subscription data:", err);
        setErrorMessage("Error processing player updates.");
      }
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
      setCurrentPlayer(gameData.getGame.players.find(p => p._id === playerId) || null);
      if(!gameData.getGame.players.find(p => p._id === playerId)) {
        setErrorMessage("You are not a part of this game")
        console.log("You are not a part of this game")
        setTimeout(() => navigate('/'), 5000); // Redirect after 3 seconds
      }
      if (gameData.getGame.stage === 2) {
        navigate(`/play-room/${gameData.getGame._id}/${playerId}`)
      }
    }
  }, [gameData, playerId, navigate, currentPlayer])

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
      await startGame({variables: { id: gameId, active: true, stage: 2, mode }})
      console.log("Game started!")
    } catch (error) {
      console.error("Error starting game:", error)
      setErrorMessage("Failed to start game.");
    }
  }

  const handleToggle = (_event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if(newMode !== null) {
      setMode(newMode)
    }
  }

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if(loadingGame) {
    return <LoadingLogo />
  }

  return (
    <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
      <Box textAlign="center" alignItems="center"  marginBottom="16px" display="flex" flexDirection="row">
        <Typography color="text.secondary">Game Code:</Typography>
        <Typography color="info" variant="h3">{game?.gameCode}</Typography>
      </Box>
      {game?.players?.[0]?._id === playerId && (
        <>
          <Button onClick={handleStartGame} variant='contained' disabled={startLoading} sx={{marginBottom: '16px'}}>
            {startLoading ? <CircularProgress size={24}/> : <Typography variant="h2" color="primary.contrastText">START GAME</Typography>}
          </Button>

          <Box marginBottom="16px" display="flex" flexDirection="column" alignItems="center">
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleToggle}
              sx={{
                borderRadius: "50px",
                overflow: "hidden",
                backgroundColor: "grey",
                "& .MuiToggleButton-root": {
                  border: "none",
                  padding: "8px 20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textTransform: "none",
                  transition: "0.3s",
                  "&.Mui-selected": {
                    backgroundColor: "info.main",
                    color: "white",
                  },
                  "&:not(.Mui-selected)": {
                    backgroundColor: "grey",
                    color: "white",
                  },
                },
              }}
            >
              <ToggleButton value="easy" sx={{ width: "100px"}}>EASY</ToggleButton>
              <ToggleButton value="standard" sx={{ width: "100px"}}>STANDARD</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </>
      )}
      {startError && <Alert severity="error">Error starting game: {startError.message}</Alert>}
      <PlayerList playerList={playerList.length > (game?.players?.length || 0) ? playerList : (game?.players || [])}/>
      {currentPlayer && (<AvatarSelection playerId={playerId || ''} gameId={gameId || ''} currentAvatarIndex={currentPlayer.icon || null} playerList={playerList.length >= (game?.players?.length || 0) ? playerList : (game?.players || [])}/>)}
    </Box>
  )
}
export default WaitingRoom;