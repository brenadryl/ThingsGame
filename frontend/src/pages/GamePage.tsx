import { Alert, Box, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useGameQuery } from '../Hooks/useGameQuery';
import { useParams } from 'react-router-dom';
import { GameState, useGameStore } from '../stores/useGameStore';
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
import GameMenu from '../Components/GameMenu';
import GameSettings from '../Components/GameSettings';
import SubmittedTransition from '../Components/Transitions/SubmittedTransition';

const ROOM_MAP: Record<Room, JSX.Element> ={
    "waiting": <WaitingRoom />,
    "guessing": <GuessingRoom />,
    "writing": <WritingRoom />,
    "play": <PlayRoom />,
    "submitted": <SubmittedRoom />,
    "score": <ScoreRoom />,
    "submitted-transition": <SubmittedTransition/>,
}

const GamePage: React.FC = () => {
  const { gameId, playerId } = useParams();
  useGameQuery(gameId, playerId)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const game = useGameStore((state: GameState) => state.game)
  const gagList = useGameStore((state: GameState) => state.gagList)
  const room = useGameStore((state: GameState) => state.room)
  const currentRound = useGameStore((state: GameState) => state.currentRound)
  const playerList = useGameStore((state: GameState) => state.playerList)
  const setRoom = useGameStore((state: GameState) => state.setRoom)
  usePlayerSubscription(gameId, setErrorMessage);
  useAvatarSubscription(gameId, setErrorMessage);
  useGameSubscription(gameId, setErrorMessage);
  useRoundSubscription(setErrorMessage, playerId || '');

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
      const gagSubmitted = !!gagList.find((g) => g.player._id === playerId) || playerId === "spectator";
      const players = playerList ?? game.players;
      const allPlayersIn = (players.length === gagList.length);
      const currentRoundGuesses = currentRound?.guesses || [];

      setRoom("submitted-transition")
      // if (game.stage === 2 && currentRound?.stage === 1 && !gagSubmitted && playerId) {
      //   console.log("set to writing room");
      //   setRoom("writing")
      // } else if (currentRound?.stage === 1 && gagSubmitted && !allPlayersIn) {
      //   console.log("set to submitted room");
      //   setRoom("submitted")
      // // } else if (game.stage === 2 && currentRound?.stage === 1 && gagSubmitted && allPlayersIn && currentRoundGuesses.length === 0 && room !== "guessing" &&) {
      // //   console.log("set to submitted transition");
      // //   setRoom("submitted-transition")
      // } else if (game.stage === 2 && currentRound?.stage === 1 && gagSubmitted && allPlayersIn) {
      //   console.log("set to guessing room");
      //   setRoom("guessing")
      // } else if (game.stage === 3) {
      //   console.log("set to score room");
      //   setRoom("score")
      // } else if (game.stage === 2 && currentRound?.stage === 2) {
      //   console.log("set to play room2");
      //   setRoom("play")
      // }
    }
  }, [game, room, gagList, setRoom, playerId, currentRound, playerList]);

  if (!game || !room) return (<LoadingLogo />);
  
  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  const roundCount = ((game?.rounds?.length ?? 0) + 1);

  return (
    <Box>
      <Box textAlign="center" alignItems="center" display="flex" flexDirection="column" paddingY="8px">
        
        { playerId !== game.players[0]._id ? 
          (<Box display="flex" flexDirection="column"> 
            <Typography variant={game.stage === 1 ? "h3" : "h2"} color="info.main">{game.stage === 1 ? "CODE" : !game.active ? "FINAL" :`ROUND ${roundCount}`}</Typography>
            {playerId === "spectator" && <Typography variant="body2">SPECTATOR VIEW</Typography>}
          </Box>)
          : (<Box position="relative" width="100%" display="flex" alignItems="center">
            <Typography
              variant={game.stage === 1 ? "h3" : "h2"}
              color="info.main"
              sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
            >
              {game.stage === 1 ? "CODE" : !game.active ? "FINAL" :`ROUND ${roundCount}`}
            </Typography>
            <Box sx={{ marginLeft: 'auto' }}>
              {game.stage === 1 ? <GameSettings /> : <GameMenu />}
            </Box>
          </Box>)
        }
        {ROOM_MAP[room]}
      </Box>
    </Box>
  )
}
export default GamePage;