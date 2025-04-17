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
import RoundTransition from '../Components/Transitions/RoundTransition';
import BeginTransition from '../Components/Transitions/BeginTransition';
import WritingTransition from '../Components/Transitions/WritingTransition';
import AwardRoom from '../Components/Rooms/AwardsRoom';

const ROOM_MAP: Record<Room, JSX.Element> ={
    "waiting": <WaitingRoom />,
    "guessing": <GuessingRoom />,
    "writing": <WritingRoom />,
    "play": <PlayRoom />,
    "submitted": <SubmittedRoom />,
    "score": <ScoreRoom />,
    "award": <AwardRoom/>,
    "submitted-transition": <SubmittedTransition/>,
    "round-transition": <RoundTransition/>,
    "begin-transition": <BeginTransition/>,
    "writing-transition": <WritingTransition/>,
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
  const setGagList = useGameStore((state: GameState) => state.setGagList)

  usePlayerSubscription(gameId, setErrorMessage);
  useAvatarSubscription(gameId, setErrorMessage);
  useGameSubscription(gameId, setErrorMessage);
  useRoundSubscription(setErrorMessage, playerId || '');

  console.log("game", game)
  if (!!game?.currentRound?.gags && game.currentRound._id === currentRound?._id && game?.currentRound?.gags?.length > gagList.length) {
    setGagList(game?.currentRound?.gags)
  }

  useEffect(() => {
    if (!game){
        setRoom(null);
    } else if (!currentRound && !game.currentRound) {
      if (game.stage === 1) {
        console.log("set to waiting room");
        setRoom("waiting")
      } else if (game.stage === 2 && room !== "play") {
        console.log("set to beginning transition");
        setRoom("begin-transition")
      } else if (game.stage === 2) {
        console.log("set to play room1");
        setRoom("play")
      }
    } else {
      const gagSubmitted = !!gagList.find((g) => g.player._id === playerId) || playerId === "spectator";
      const players = playerList ?? game.players;
      const allPlayersIn = (players.length === gagList.length);
      const currentRoundGuesses = currentRound?.guesses || [];

      if (game.stage === 3 && !game.active) {
        console.log("set to award room");
        setRoom("award")
      } else if (currentRound?.stage === 1 && gagSubmitted && !allPlayersIn) {
        console.log("set to submitted room");
        setRoom("submitted")
      } else if (game.stage === 2 && currentRound?.stage === 1 && !gagSubmitted && playerId && room !== "writing" && !currentRound.gags) {
        console.log("set to writing room");
        setRoom("writing-transition")
      } else if (game.stage === 2 && currentRound?.stage === 1 && !gagSubmitted && playerId) {
        console.log("set to writing room");
        setRoom("writing")
      } else if (game.stage === 2 && currentRound?.stage === 1 && gagSubmitted && allPlayersIn && currentRoundGuesses.length === 0 && room !== "guessing") {
        console.log("set to submitted transition");
        setRoom("submitted-transition")
      } else if (game.stage === 2 && currentRound?.stage === 1 && gagSubmitted && allPlayersIn) {
        console.log("set to guessing room");
        setRoom("guessing")
      } else if (game.stage === 3 && game.active && room !== "score") {
        console.log("set to round transition");
        setRoom("round-transition")
      } else if (game.stage === 3 && game.active) {
        console.log("set to score room");
        setRoom("score")
      } else if (game.stage === 2 && currentRound?.stage === 2 && room !== "play") {
        console.log("set to beginning transition2");
        setRoom("begin-transition")
      } else if (game.stage === 2 && currentRound?.stage === 2) {
        console.log("set to play room2");
        setRoom("play")
      }
    }
  }, [game, room, gagList, setRoom, playerId, currentRound, playerList]);

  if (!game || !room) return (<LoadingLogo />);
  
  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  return (
    <Box>
      <Box textAlign="center" alignItems="center" display="flex" flexDirection="column" paddingY="8px">
        {ROOM_MAP[room]}
      </Box>
    </Box>
  )
}
export default GamePage;