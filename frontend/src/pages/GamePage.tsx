import { Alert, Box, Button, CircularProgress} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useGameQuery } from '../Hooks/useGameQuery';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../stores/useGameStore';
import LoadingLogo from '../Components/LoadingLogo';
import WaitingRoom from '../Components/Rooms/WaitingRoom';
import GuessingRoom from '../Components/Rooms/GuessingRoom';
import WritingRoom from '../Components/Rooms/WritingRoom';
import ScoreRoom from '../Components/Rooms/ScoreRoom';
import SubmittedRoom from '../Components/Rooms/SubmittedRoom';
import { Room } from '../types';
import PlayRoom from '../Components/Rooms/PlayRoom';
import { usePlayerSubscription } from '../Hooks/usePlayerSubscription';
import { useAvatarSubscription } from '../Hooks/useAvatarSubscription';
import { useGameSubscription } from '../Hooks/useGameSubscription';
import { useRoundSubscription } from '../Hooks/useRoundSubscription';
import { useMutation } from '@apollo/client';
import { CHANGE_GAME_MUTATION } from '../graphql/mutations/gameMutations';

const ROOM_MAP: Record<Room, JSX.Element> ={
    "waiting": <WaitingRoom />,
    "guessing": <GuessingRoom />,
    "writing": <WritingRoom />,
    "play": <PlayRoom />,
    "submitted": <SubmittedRoom />,
    "score": <ScoreRoom />,
}

const GamePage: React.FC = () => {
  const { gameId, playerId } = useParams();
  useGameQuery(gameId, playerId)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const game = useGameStore((state) => state.game)
  const gagList = useGameStore((state) => state.gagList)
  const room = useGameStore((state) => state.room)
  const currentRound = useGameStore((state) => state.currentRound)
  const playerList = useGameStore((state) => state.playerList)
  const setRoom = useGameStore((state) => state.setRoom)
  usePlayerSubscription(gameId, setErrorMessage);
  useAvatarSubscription(gameId, setErrorMessage);
  useGameSubscription(gameId, setErrorMessage);
  useRoundSubscription(setErrorMessage, playerId || '');
  const [updateGame, {loading: updateGameLoading, error: updateGameError}] = useMutation(CHANGE_GAME_MUTATION);

  useEffect(() => {
    if (!game){
        setRoom(null);
    } else if (!currentRound && !game.currentRound) {
      if (game.stage === 1) {
        console.log("set to waiting room");
        setRoom("waiting")
      } else if (game.stage === 2) {
        console.log("set to play room1");
        setRoom("play")
      }
    } else {
      const gagSubmitted = gagList.find((g) => g.player._id === playerId);
      console.log("gagSubmitted", gagSubmitted)
      const players = playerList ?? game.players;
      const allPlayersIn = (players.length === gagList.length);
      console.log("allPlayersIn", allPlayersIn)
      console.log("game.stage", game.stage)

      if (game.stage === 2 && currentRound?.stage === 1 && !gagSubmitted) {
        console.log("set to writing room");
        setRoom("writing")
      } else if (currentRound?.stage === 1 && gagSubmitted && !allPlayersIn) {
        console.log("set to submitted room");
        setRoom("submitted")
      } else if (game.stage === 2 && currentRound?.stage === 1 && gagSubmitted && allPlayersIn) {
        console.log("set to guessing room");
        setRoom("guessing")
      } else if (game.stage === 3) {
        console.log("set to score room");
        setRoom("score")
      } else if (game.stage === 2 && currentRound?.stage === 2) {
        console.log("set to play room2");
        setRoom("play")
      }
    }
  }, [game, gagList, setRoom, playerId, currentRound, playerList]);

  useEffect(() => {
    if (updateGameError) {
      setErrorMessage(updateGameError.message)
    }
  }, [updateGameError])

  const handleEndGame = async () => {
    if (!gameId) return;
    try {
      await updateGame({variables: { id: gameId, active: false, stage: 3 }})
      console.log("Game Ended!")
    } catch (error) {
      console.error("Error ending game:", error)
      setErrorMessage("Failed to end game.");
    }
  }

  if (!game || !room) return (<LoadingLogo />);
  
  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  return (
    <Box>
      <Box textAlign="center" alignItems="center" display="flex" flexDirection="column">
          {ROOM_MAP[room]}
      </Box>
      {playerId === game.players[0]._id && (
        <Box textAlign="center" marginTop="15px">
          <Button onClick={handleEndGame} color="error" variant='contained' disabled={updateGameLoading} sx={{marginTop: '24px'}}>
            {updateGameLoading ? <CircularProgress size={24}/> : "END GAME"}
          </Button>
        </Box>
      )}
    </Box>
  )
}
export default GamePage;