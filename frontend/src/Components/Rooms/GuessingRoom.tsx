import { Alert, Box, Typography} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Gag, Guess, Player } from '../../types';
import GagSelection from '../GagSelection';
import GuessAnnouncementModal from '../GuessAnnouncementModal';
import ConfirmGuessModal from '../ConfirmGuessModal';
import PlayerDrawer from '../PlayerDrawer';
import PlayerTurnCarousel from '../PlayerTurnCarousel';
import { GameState, useGameStore } from '../../stores/useGameStore';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { NEW_LIKE } from '../../graphql/mutations/likeMutation';
import { NEW_GUESS } from '../../graphql/mutations/guessMutations';
import { useGagSubscription } from '../../Hooks/useGagSubscription';
import { useGameSubscription } from '../../Hooks/useGameSubscription';
import { useGuessSubscription } from '../../Hooks/useGuessSubscription';
import { useLikeSubscription } from '../../Hooks/useLikeSubscription';
import { getCurrentTurn } from '../../utils/gameUtils';

 
const GuessingRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isModalOpen, setModalOpen] = useState(false)
  const [closingAnnouncement, setClosingAnnouncement] = useState(false)
  const [selectedGag, setSelectedGag] = useState<Gag | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const game = useGameStore((state: GameState) => state.game);
  const playerList = useGameStore((state: GameState) => state.playerList);
  const currentRound = useGameStore((state: GameState) => state.currentRound);
  const isMyTurn = useGameStore((state: GameState) => state.myTurn)
  const setMyTurn = useGameStore((state: GameState) => state.setMyTurn)
  const currentTurnPlayer = useGameStore((state: GameState) => state.currentTurnPlayer);
  const setCurrentTurnPlayer = useGameStore((state: GameState) => state.setCurrentTurnPlayer);
  const guessList = useGameStore((state: GameState) => state.guessList);
  const gagList = useGameStore((state: GameState) => state.gagList);
  const newGuess = useGameStore((state: GameState) => state.newGuess);
  const setNewGuess = useGameStore((state: GameState) => state.setNewGuess);
  console.log("currentRound", currentRound)
  console.log("currentTurnPlayer", currentTurnPlayer)
  console.log("isMyTurn", isMyTurn)

  const [createGuess] = useMutation(NEW_GUESS)
  const [createLike] = useMutation(NEW_LIKE)
  
  useGagSubscription(setErrorMessage);
  useGameSubscription(gameId, setErrorMessage);
  useGuessSubscription(playerId, setErrorMessage);
  useLikeSubscription(setErrorMessage);

  useEffect(() => {
    if (!currentTurnPlayer) {  
      const lastWrongGuess = guessList.filter((guess: Guess) => !guess.isCorrect)[0];
      const currTurnPlayer = getCurrentTurn(playerList, lastWrongGuess, currentRound?.turn || 0, gagList);
      setCurrentTurnPlayer(currTurnPlayer);
      if (currTurnPlayer?._id === playerId) setMyTurn(true);
    }
  }, [currentTurnPlayer, guessList, currentRound, gagList, playerList, setCurrentTurnPlayer, setMyTurn, playerId])


  useEffect(() => {
    console.log("newGuess1", newGuess)
    console.log("isOpen1", closingAnnouncement)
    if (newGuess === null) {
      setClosingAnnouncement(false)
    }
    if (newGuess !== null && !closingAnnouncement) {
      const timer = setTimeout(() => {
        setClosingAnnouncement(true)
      }, 6000)
      return () => clearTimeout(timer);
    }
    if (newGuess !== null && closingAnnouncement) {
      const lastWrongGuess = guessList.filter((guess: Guess) => !guess.isCorrect)[0];
      const turnPlayer = getCurrentTurn(playerList, lastWrongGuess, currentRound?.turn || 0, gagList);
      if (currentTurnPlayer?._id !== turnPlayer?._id) setCurrentTurnPlayer(turnPlayer);
      const myTurnStatus = turnPlayer?._id === playerId;
      if (myTurnStatus !== isMyTurn) setMyTurn(turnPlayer?._id === playerId);
      setNewGuess(null)
    }
  }, [newGuess, closingAnnouncement, currentRound, isMyTurn, playerId, gagList, guessList, playerList, setMyTurn, setCurrentTurnPlayer, setNewGuess, currentTurnPlayer])

  const handleAnnouncementClose = useCallback(() => {
    setClosingAnnouncement(true);
  }, [])

  const handleGagClick = useCallback((gag: Gag) => {
    setSelectedGag(gag)
    setDrawerOpen(true)
  }, [])
  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
    setSelectedGag(null)
  }, [])
  const handleFavorite = useCallback(async (favId: string) => {
    await createLike({
      variables: {
        playerId: playerId,
        roundId: currentRound?._id || '',
        gagId: favId,
      }
    })
  }, [currentRound?._id, createLike, playerId])
  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setSelectedGag(null)
    setSelectedPlayer(null)
    setDrawerOpen(false)
  }, [])
  const handlePlayerClick = useCallback((player: Player) => {
    if (isMyTurn) {
      setSelectedPlayer(player)
      setModalOpen(true)
      setDrawerOpen(false)
    }
  }, [isMyTurn])
  const handleConfirmGuess = useCallback(async () => {
    if (!selectedGag || !selectedPlayer) return
    try {
      await createGuess({
        variables: {
          gagId: selectedGag._id,
          guesserId: playerId,
          guessedId: selectedPlayer._id,
        }
      })
      handleCloseModal();
    } catch (error: any) {
      setErrorMessage(error?.message || "Guess was not submitted.");
      handleCloseModal()
    }
  }, [createGuess, handleCloseModal, playerId, selectedGag, selectedPlayer])

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  return (
    <>
    <GuessAnnouncementModal playerId={playerId || ''} newGuess={newGuess} handleClose={handleAnnouncementClose} />
    <ConfirmGuessModal isModalOpen={isModalOpen} selectedGag={selectedGag} selectedPlayer={selectedPlayer} handleCloseModal={handleCloseModal} handleConfirmGuess={handleConfirmGuess}/>
    <PlayerDrawer players={playerList || []} isDrawerOpen={isDrawerOpen} handleCloseDrawer={handleCloseDrawer} handlePlayerClick={handlePlayerClick} />
      <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
        <Box textAlign="center" alignItems="center"  marginBottom="32px" marginTop="8px">
          <Typography color="info" variant="h3">{currentRound?.promptText}</Typography>
        </Box>

        <PlayerTurnCarousel players={playerList || []} playerId={playerId || ''}/>

        <Box bgcolor="background.default" padding="8px" zIndex={1}>
          <Typography color={isMyTurn ? "warning.main" : "secondary.light"}>{isMyTurn ? "YOUR TURN" : `${currentTurnPlayer?.name} IS GUESSING`}</Typography>
        </Box>
        <GagSelection onClick={handleGagClick} playerId={playerId || ''} setFavorite={handleFavorite} isStandardMode={game?.mode === "standard"}/>
      </Box>
    </>
  )
}
export default GuessingRoom;