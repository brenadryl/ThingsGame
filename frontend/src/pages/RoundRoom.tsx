import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Gag, Game, Guess, Player } from '../types';
import { useSubscription } from '@apollo/client';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import PlayerList from '../Components/PlayerList';
import { GAG_UPDATE_SUBSCRIPTION } from '../graphql/subscriptions/gagSubscriptions';
import PlayerSelection from '../Components/PlayerSelection';
import GagSelection from '../Components/GagSelection';
import { NEW_GUESS } from '../graphql/mutations/guessMutations';
import { NEW_GUESS_SUBSCRIPTION } from '../graphql/subscriptions/guessSubscription';
import GuessAnnouncementModal from '../Components/GuessAnnouncementModal';
import ConfirmGuessModal from '../Components/ConfirmGuessModal';
import PlayerDrawer from '../Components/PlayerDrawer';


const RoundRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isModalOpen, setModalOpen] = useState(false)
  const [newGuess, setNewGuess] = useState<Guess | null>(null)
  const [gagList, setGagList] = useState<Gag[]>([])
  const [guessList, setGuessList] = useState<Guess[]>([])
  const [selectedGag, setSelectedGag] = useState<Gag | null>(null);
  const [favorite, setFavorite] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading: loadingGame, error: errorGame, data: gameData } = useQuery<GetGameData>(GET_GAME, {
    variables: {id: gameId},
    skip: !gameId,
  });
  const [createGuess] = useMutation(NEW_GUESS)
  const { error: errorSubscription } = useSubscription(GAG_UPDATE_SUBSCRIPTION, {
    variables: { roundId: game?.currentRound._id },
    skip: !game?.currentRound._id,
    onSubscriptionData: ({subscriptionData}) => {
      console.log("gag subscriptionData",subscriptionData )
      try {
        if (subscriptionData?.data?.gagUpdate) {
          console.log("Subscription received updated Gag data:", subscriptionData.data?.gagUpdate);
          const updatedGags = subscriptionData.data?.gagUpdate;
          setGagList(updatedGags)
        } else {
          console.warn("Subscription did not return expected data.");
        }
      } catch (err) {
        console.error("Error processing subscription data:", err);
        setErrorMessage("Error processing player updates.");
      }
      console.log("gagList: ", gagList)
    }
  });

  const { error: guessSubscriptionError } = useSubscription(NEW_GUESS_SUBSCRIPTION, {
    variables: { roundId: game?.currentRound._id },
    skip: !game?.currentRound._id,
    onSubscriptionData: ({subscriptionData}) => {
      console.log("guess subscriptionData",subscriptionData )
      try {
        if (subscriptionData?.data?.newGuess) {
          console.log("Subscription received new guess data:", subscriptionData.data?.newGuess);
          const updatedGuesses = subscriptionData.data?.newGuess;
          if (updatedGuesses.length > guessList.length) {
            setNewGuess(subscriptionData.data?.newGuess[0])
          }
          setGuessList(updatedGuesses)
        } else {
          console.warn("Subscription did not return expected data.");
        }
      } catch (err) {
        console.error("Error processing subscription data:", err);
        setErrorMessage("Error processing player updates.");
      }
      console.log("guessList: ", guessList)
    }
  });

  useEffect(() => {
    console.log(gameData)
    if(gameData?.getGame) {
      setGame(gameData.getGame)
      setGagList(gameData.getGame.currentRound.gags)
      setGuessList(gameData.getGame.currentRound.guesses)
      const currentPlayer = gameData.getGame.players.find(p => p._id === playerId) || null;
      if(!currentPlayer) {
        setErrorMessage("You are not a part of this game")
        console.log("You are not a part of this game")
        setTimeout(() => navigate('/'), 5000); // Redirect after 3 seconds
      }
      if (gameData.getGame.currentRound.stage === 3) {
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
      setErrorMessage("Error fetching gags: " + errorSubscription.message)
    } else if (guessSubscriptionError) {
      setErrorMessage("Error fetching guesses: " + guessSubscriptionError.message)
    }
  }, [gameId, playerId, errorGame, errorSubscription, guessSubscriptionError])

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if(loadingGame) {
    return <CircularProgress />
  }

  const wrongGuesses = game?.currentRound.guesses.filter((guess) => !guess.isCorrect)
  const currentTurn = (((game?.currentRound?.turn || 0) + (wrongGuesses?.length || 0)) % (game?.players.length || 1));
  console.log("Game?.currentRound", game?.currentRound)
  const currentTurnPlayer = game?.players[currentTurn];
  const myTurn = currentTurnPlayer?._id === playerId;

  const handleGagClick = (gag: Gag) => {
    setSelectedGag(gag)
    setDrawerOpen(true)
  }
  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedGag(null)
  }
  const handleFavorite = (favId: string) => {
    setFavorite(favId)
  }
  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedGag(null)
    setSelectedPlayer(null)
    setDrawerOpen(false)
  }
  const handlePlayerClick = (player: Player) => {
    console.log("myTurn, ", myTurn)
    if (myTurn) {
      console.log("player, ", player)
      setSelectedPlayer(player)
      setModalOpen(true)
      setDrawerOpen(false)
    }
  }
  const handleConfirmGuess = async () => {
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
    } catch (error) {
      console.error("Error submitting guess: ", error)
      setErrorMessage("Guess was not submitted.")
      handleCloseModal()
    }
  }

  const handleCloseAnnouncement = () => {
    setNewGuess(null);
  }



  console.log("game", game)

  return (
    <>
    <GuessAnnouncementModal hasNewGuess={newGuess !== null} newGuess={newGuess} handleClose={handleCloseAnnouncement}/>
    <ConfirmGuessModal isModalOpen={isModalOpen} selectedGag={selectedGag} selectedPlayer={selectedPlayer} handleCloseModal={handleCloseModal} handleConfirmGuess={handleConfirmGuess}/>
    <PlayerDrawer isDrawerOpen={isDrawerOpen} playerList={game?.players || []} gagList={gagList || []} handleCloseDrawer={handleCloseDrawer} handlePlayerClick={handlePlayerClick} />
      <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
          <Typography color="text.secondary">{myTurn ? "SELECT A RESPONSE TO GUESS WHO SAID IT" : `${currentTurnPlayer?.name} IS GUESSING`}</Typography>
        <Box textAlign="center" alignItems="center"  marginBottom="32px" marginTop="8px">
          <Typography color="info" variant="h3">{game?.currentRound.promptText}</Typography>
        </Box>
        {game?.players.length === game?.currentRound.gags.length ? 
        (<GagSelection gagList={gagList || []} onClick={handleGagClick} myTurn={myTurn} setFavorite={handleFavorite}/>): 
        (<PlayerSelection playerList={game?.players || []} gagList={gagList || []} onClick={() => {}}/>)}
        {/* {game?.players?.[0]?._id === playerId && (
          <Button onClick={handleStartGame} variant='contained' disabled={startLoading} sx={{marginTop: '24px'}}>
            {startLoading ? <CircularProgress size={24}/> : "START GAME"}
          </Button>
        )} */}
        {/* {startError && <Alert severity="error">Error starting game: {startError.message}</Alert>} */}
      </Box>
    </>
  )
}
export default RoundRoom;