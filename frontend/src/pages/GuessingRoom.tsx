import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Typography} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Gag, Game, Guess, Like, Player } from '../types';
import { useSubscription } from '@apollo/client';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import GagSelection from '../Components/GagSelection';
import { NEW_GUESS } from '../graphql/mutations/guessMutations';
import { NEW_GUESS_SUBSCRIPTION } from '../graphql/subscriptions/guessSubscription';
import GuessAnnouncementModal from '../Components/GuessAnnouncementModal';
import ConfirmGuessModal from '../Components/ConfirmGuessModal';
import PlayerDrawer from '../Components/PlayerDrawer';
import LoadingLogo from '../Components/LoadingLogo';
import { GAME_STAGE_SUBSCRIPTION } from '../graphql/subscriptions/gameSubscriptions';
import { NEW_LIKE_SUBSCRIPTION } from '../graphql/subscriptions/likeSubscriptions';
import { NEW_LIKE } from '../graphql/mutations/likeMutation';
import { GAG_UPDATE_SUBSCRIPTION } from '../graphql/subscriptions/gagSubscriptions';
import PlayerTurnCarousel from '../Components/PlayerTurnCarousel';
import useDirector from '../Hooks/useDirector';


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

 
const GuessingRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  useDirector(gameId, playerId, "guessing")
  const navigate = useNavigate();
  const processedGameData = useRef(false);
  const [game, setGame] = useState<Game | null>(null)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isModalOpen, setModalOpen] = useState(false)
  const [myTurn, setMyTurn] = useState(false)
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<Player | null>(null)
  const [newGuess, setNewGuess] = useState<Guess | null>(null)
  const [gagList, setGagList] = useState<Gag[]>([])
  const [guessList, setGuessList] = useState<Guess[]>([])
  const [likes, setLikes] = useState<Like[]>([])
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
  const [createLike] = useMutation(NEW_LIKE)


  useSubscription(GAME_STAGE_SUBSCRIPTION, {
    variables: {gameId},
    onSubscriptionData: ({subscriptionData}) => {
      const updatedGame = subscriptionData?.data?.gameStageChange;
      if (updatedGame.stage === 3) {
        console.log("Round ended! Navigating to ScoreRoom...")
        navigate(`/score-room/${gameId}/${playerId}`)
      }
    }
  })

  const { error: likesSubscriptionError } = useSubscription(NEW_LIKE_SUBSCRIPTION, {
    variables: { roundId: game?.currentRound._id },
    skip: !game?.currentRound._id,
    onSubscriptionData: ({subscriptionData}) => {
      try {
        if (subscriptionData?.data?.newLike) {
          console.log("Subscription received new like data:", subscriptionData.data?.newLike);
          const updateLikes = subscriptionData.data?.newLike;
          console.log("updateLikes", updateLikes)
          const fav = updateLikes.find((l: any) => l.player._id === playerId)?.gag?._id || '';
          setFavorite(fav)
          setLikes(updateLikes)
        } else {
          console.warn("Subscription did not return expected data.");
        }
      } catch (err) {
        console.error("Error processing subscription data:", err);
        setErrorMessage("Error processing like updates.");
      }
    }
  });

    const { error: gagErrorSubscription } = useSubscription(GAG_UPDATE_SUBSCRIPTION, {
      variables: { roundId: game?.currentRound._id },
      skip: !game?.currentRound._id,
      onSubscriptionData: ({subscriptionData}) => {
        console.log("gag subscriptionData",subscriptionData )
        try {
          if (subscriptionData?.data?.gagUpdate) {
            console.log("Subscription received updated Gag data:", subscriptionData.data?.gagUpdate);
            const updatedGags = subscriptionData.data?.gagUpdate;
            const sortedGags = [...updatedGags].sort((a, b) => a.text.localeCompare(b.text));
            setGagList(sortedGags)
          } else {
            console.warn("Subscription did not return expected data.");
          }
        } catch (err) {
          console.error("Error processing subscription data:", err);
          setErrorMessage("Error processing player updates.");
        }
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
    if(gameData?.getGame && !processedGameData.current) {
      console.log("gameData ", gameData)
      processedGameData.current = true;
      setGame(gameData.getGame)
      if (gameData.getGame.currentRound.gags.length > gagList.length) {
        const sortedGags = [...gameData.getGame.currentRound.gags].sort((a, b) => a.text.localeCompare(b.text));
        setGagList(sortedGags)
      }
      if (gameData.getGame.currentRound.likes && gameData.getGame.currentRound.likes.length > likes.length) {
        setLikes(gameData.getGame.currentRound.likes)
        const fav = gameData.getGame.currentRound.likes.find(l => l.player._id === playerId)?.gag?._id || "";
        setFavorite(fav)
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

      if (gameData.getGame.stage === 3) {
        navigate(`/score-room/${gameData.getGame._id}/${playerId}`)
      }
    }
  }, [gameData, playerId, navigate, gagList, likes])

  useEffect(() => {
    if (!gameId || !playerId) {
      setErrorMessage("Invalid Game ID or Player ID")
    } else if (errorGame) {
      setErrorMessage("Error fetching game data: " + errorGame.message)
    } else if (guessSubscriptionError) {
      setErrorMessage("Error fetching guesses: " + guessSubscriptionError.message)
    } else if (gagErrorSubscription) {
      setErrorMessage("Error fetching guesses: " + gagErrorSubscription.message)
    } else if (likesSubscriptionError) {
      setErrorMessage("Error fetching guesses: " + likesSubscriptionError.message)
    }
  }, [gameId, playerId, errorGame, guessSubscriptionError, likesSubscriptionError, gagErrorSubscription])

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
  const handleFavorite = async (favId: string) => {
    setFavorite(favId)
    await createLike({
      variables: {
        playerId: playerId,
        roundId: game?.currentRound._id,
        gagId: favId,
      }
    })
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

        <PlayerTurnCarousel players={game?.players || []} currentPlayerTurn={currentTurnPlayer} gags={gagList} playerId={playerId || ''}/>

        <Box bgcolor="background.default" padding="8px" zIndex={1}>
          {newGuess !== null ? 
            <Typography color="text.default"> GUESSING</Typography>
            : <>
              <Typography color={myTurn ? "warning.main" : "secondary.light"}>{myTurn ? "YOUR TURN" : `${currentTurnPlayer?.name} IS GUESSING`}</Typography>
            </>
          }
        </Box>
        <GagSelection gagList={gagList || []} onClick={handleGagClick} myTurn={myTurn} setFavorite={handleFavorite} likes={likes} favorite={favorite} guesses={guessList} isStandardMode={game?.mode === "standard"}/>
      </Box>
    </>
  )
}
export default GuessingRoom;