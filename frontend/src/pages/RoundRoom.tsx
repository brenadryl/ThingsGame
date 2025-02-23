import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Typography} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Gag, Game, Guess, Player } from '../types';
import { useSubscription } from '@apollo/client';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { GAG_UPDATE_SUBSCRIPTION } from '../graphql/subscriptions/gagSubscriptions';
import PlayerSelection from '../Components/PlayerSelection';
import GagSelection from '../Components/GagSelection';
import { NEW_GUESS } from '../graphql/mutations/guessMutations';
import { NEW_GUESS_SUBSCRIPTION } from '../graphql/subscriptions/guessSubscription';
import GuessAnnouncementModal from '../Components/GuessAnnouncementModal';
import ConfirmGuessModal from '../Components/ConfirmGuessModal';
import PlayerDrawer from '../Components/PlayerDrawer';
import { UPDATE_GAG } from '../graphql/mutations/gagMutations';
import LoadingLogo from '../Components/LoadingLogo';


const getCurrentTurn = (playerList: Player[] | undefined, lastWrongGuess: Guess | undefined, turn: number, gagList: Gag[] | undefined) => {
  if (!playerList) return null;
  if (!lastWrongGuess) {
    return playerList ? playerList[turn] : null;
  }
  let currentPlayerIndex = playerList?.findIndex((player) => player._id === lastWrongGuess.guesser._id);
  if (currentPlayerIndex === -1) return playerList ? playerList[turn] : null;
  while (true) {
    currentPlayerIndex = (currentPlayerIndex + 1) % playerList.length;

    // eslint-disable-next-line no-loop-func
    if (! gagList || gagList.find((gag) => gag.player._id === playerList[currentPlayerIndex]._id && !gag.guessed)) return playerList[currentPlayerIndex]
  }
 }

 
const RoundRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const navigate = useNavigate();
  const processedGameData = useRef(false);
  const roundEnded = useRef(false);
  const [game, setGame] = useState<Game | null>(null)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isModalOpen, setModalOpen] = useState(false)
  const [myTurn, setMyTurn] = useState(false)
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<Player | null>(null)
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
    fetchPolicy: "network-only",
  });
  const [createGuess] = useMutation(NEW_GUESS)
  const [updateGag] = useMutation(UPDATE_GAG)
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
      try {
        if (subscriptionData?.data?.newGuess) {
          console.log("Subscription received new guess data:", subscriptionData.data?.newGuess);
          const updatedGuesses = subscriptionData.data?.newGuess;
          console.log("updatedGuesses, ", updatedGuesses)
          console.log("guessList, ", guessList)
          if (updatedGuesses.length > guessList.length) {
            console.log("new guess!!!! ", updatedGuesses)
            setNewGuess(updatedGuesses[0])
          }
          setGuessList(updatedGuesses)
          console.log("updatedGuesses", updatedGuesses)
          const lastWrongGuess = updatedGuesses?.filter((guess: Guess) => !guess.isCorrect)[0];
          const currPlayerTurn = getCurrentTurn(game?.players, lastWrongGuess, game?.currentRound.turn || 0, gagList);
          setCurrentTurnPlayer(currPlayerTurn);
          setMyTurn(currPlayerTurn?._id === playerId);
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
    if (gagList.length > 0 && gagList.every((gag: Gag) => gag.guessed)) {
      console.log("End of round")
      if (!roundEnded.current) {
        roundEnded.current = true;
  
        if (favorite !== '') {
          try {
              updateGag({
              variables: {
                id: favorite,
                votes: 1,
              }
            })
          } catch (error) {
            console.error("Error selecting favorite: ", error)
            setErrorMessage("Response was not favorited")
          }
        }
      }
      setTimeout(() => navigate(`/score-room/${gameId}/${playerId}`), 3000); // Redirect after 3 seconds
    }
  }, [gagList, updateGag, favorite, gameId, navigate, playerId])

  useEffect(() => {
    if(gameData?.getGame && !processedGameData.current) {
      processedGameData.current = true;
      setGame(gameData.getGame)
      if (gameData.getGame.currentRound.gags.length > gagList.length) {
        setGagList(gameData.getGame.currentRound.gags)
      }
      setGuessList(gameData.getGame.currentRound.guesses)

      const lastWrongGuess = gameData.getGame.currentRound.guesses.filter((guess: Guess) => !guess.isCorrect)[0];
      const currPlayerTurn = getCurrentTurn(gameData.getGame?.players, lastWrongGuess, gameData.getGame?.currentRound.turn || 0, gameData.getGame.currentRound.gags);
      setCurrentTurnPlayer(currPlayerTurn);
      setMyTurn(currPlayerTurn?._id === playerId);

      if (currPlayerTurn?._id !== playerId) {
        setSelectedGag(null)
      }

      const currentPlayer = gameData.getGame.players.find(p => p._id === playerId) || null;

      if(!currentPlayer) {
        setErrorMessage("You are not a part of this game")
        console.log("You are not a part of this game")
        setTimeout(() => navigate('/'), 5000); // Redirect after 3 seconds
      }

      if (gameData.getGame.currentRound.stage === 2) {
        navigate(`/score-room/${gameData.getGame._id}/${playerId}`)
      }
    }
  }, [gameData, playerId, navigate, gagList.length])

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
    return <LoadingLogo />
  }

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
    if (myTurn) {
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
    setSelectedGag(null)
    setSelectedPlayer(null)
    setNewGuess(null);
  }

  return (
    <>
    <GuessAnnouncementModal hasNewGuess={newGuess !== null} newGuess={newGuess} handleClose={handleCloseAnnouncement} />
    <ConfirmGuessModal isModalOpen={isModalOpen} selectedGag={selectedGag} selectedPlayer={selectedPlayer} handleCloseModal={handleCloseModal} handleConfirmGuess={handleConfirmGuess}/>
    <PlayerDrawer isDrawerOpen={isDrawerOpen} playerList={game?.players || []} gagList={gagList || []} handleCloseDrawer={handleCloseDrawer} handlePlayerClick={handlePlayerClick} />
      <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
        <Box textAlign="center" alignItems="center"  marginBottom="32px" marginTop="8px">
          <Typography color="info" variant="h3">{game?.currentRound.promptText}</Typography>
        </Box>
        <Box bgcolor="background.default" padding="8px" zIndex={1}>
          {newGuess !== null ? 
            <Typography color="text.default"> GUESSING</Typography>
            : <>
              <Typography color={myTurn ? "warning.main" : "secondary.light"}>{myTurn ? "YOUR TURN" : `${currentTurnPlayer?.name} IS GUESSING`}</Typography>
            </>
          }
        </Box>

        {(game?.players.length === game?.currentRound.gags.length) || (game?.players.length === gagList.length) ? 
        (<GagSelection gagList={gagList || []} onClick={handleGagClick} myTurn={myTurn} setFavorite={handleFavorite}/>): 
        (<PlayerSelection playerList={game?.players || []} gagList={gagList || []} onClick={() => {}}/>)}
      </Box>
    </>
  )
}
export default RoundRoom;