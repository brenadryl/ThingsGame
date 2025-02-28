import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Emotion, Gag, Game, Player } from '../types';
import { useSubscription } from '@apollo/client';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { CHANGE_GAME_MUTATION } from '../graphql/mutations/gameMutations';
import { GAME_STAGE_SUBSCRIPTION } from '../graphql/subscriptions/gameSubscriptions';
import PlayerCard from '../Components/PlayerCards';
import LoadingLogo from '../Components/LoadingLogo';
import SuperlativeCard from '../Components/Superlatives';

const SUPERLATIVE_DESCRIPTIONS = {
    mostLiked: { title: "mr popular" , description: "most liked", emotion: "happy" },
    liker: { title: "hype man" , description: "liked everyone", emotion: "neutral"  },
    mostSus: { title: "most sus" , description: "fooled everyone", emotion: "suspicious"  },
    easyOut: { title: "captain obvious" , description: "easiest to guess", emotion: "sad"  },
    probablyBot: { title: "probs a bot" , description: "blandest answers", emotion: "sad"  }, // least liked
    sniper: { title: "sniper" , description: "most accurate guesser", emotion: "suspicious"  },
    selfLike: { title: "self five" , description: "liked themself most", emotion: "happy"  },
    tldr: { title: "rambler" , description: "most verbose", emotion: "neutral"  }, //rambler
    minimalist: { title: "one word wonder" , description: "master of brevity", emotion: "neutral"  }, //one word wonder
}

type SuperlativeKey = keyof typeof SUPERLATIVE_DESCRIPTIONS;


const getSuperlatives = (players: Player[]) => {
    let superlatives = {
        mostLiked: "",
        liker: "",
        mostSus: "",
        easyOut:"",
        probablyBot: "", // least liked
        sniper: "",
        selfLike: "",
        tldr: "", //rambler
        minimalist: "", //one word wonder
    }

    if (players && players.length > 0) {
        const getTotalLikesReceived = (player: Player) => player.likesReceived.length;
        const getTotalLikesGiven = (player: Player) => player.likesGiven.length;
        const getIncorrectGuessesReceived = (player: Player) => player.guessesReceived.filter((guess) => !guess.isCorrect).length;
        const getCorrectGuessesMade = (player: Player) => player.guessesMade.filter((guess) => guess.isCorrect).length;
        const getSelfLikes = (player: Player) => player.likesGiven.filter((like) => like.gag && like.gag.player._id === player._id).length;
        const getTotalGagTextLength = (player: Player) => player.gags.reduce((sum, gag) => sum + (gag.text?.length || 0), 0);

        const mostLiked = players.reduce((max, p) => (getTotalLikesReceived(p) > getTotalLikesReceived(max) ? p : max), players[0]);
        const liker = players.reduce((max, p) => (getTotalLikesGiven(p) > getTotalLikesGiven(max) ? p : max), players[0]);
        const mostSus = players.reduce((max, p) => (getIncorrectGuessesReceived(p) > getIncorrectGuessesReceived(max) ? p : max), players[0]);

        const easyOut = players.reduce((min, p) =>
            (getIncorrectGuessesReceived(p) < getIncorrectGuessesReceived(min) || (getIncorrectGuessesReceived(p) === getIncorrectGuessesReceived(min) && p.guessesMade.length < min.guessesMade.length)) ? p : min, players[0]);
        const sniper = players.reduce((max, p) => (getCorrectGuessesMade(p) > getCorrectGuessesMade(max) ? p : max), players[0]);
        const leastLiked = players.reduce((min, p) => (getTotalLikesReceived(p) < getTotalLikesReceived(min) ? p : min), players[0]);
        const minimalist = players.reduce((min, p) => (getTotalGagTextLength(p) < getTotalGagTextLength(min) ? p : min), players[0]);
        const rambler = players.reduce((max, p) => (getTotalGagTextLength(p) > getTotalGagTextLength(max) ? p : max), players[0]);
        const selfLike = players.reduce((max, p) => (getSelfLikes(p) > getSelfLikes(max) ? p : max), players[0]);
        superlatives = {
            mostLiked: mostLiked._id,
            liker: liker._id,
            mostSus: mostSus._id,
            easyOut: easyOut._id,
            probablyBot: leastLiked._id, // least liked
            sniper: sniper._id,
            selfLike: selfLike._id,
            tldr: rambler._id, //rambler
            minimalist: minimalist._id, //one word wonder
        }

    }
    return superlatives;
}

const ScoreRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null)
  const [allLikeCounts, setAllLikeCounts] = useState<Record<string, number>>({})
  const [favoriteGags, setFavoriteGags] = useState<(Gag | null)[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading: loadingGame, error: errorGame, data: gameData } = useQuery<GetGameData>(GET_GAME, {
    variables: {id: gameId},
    skip: !gameId,
    fetchPolicy: "network-only",
  });
  const [updateGame, {loading: updateGameLoading, error: updateGameError}] = useMutation(CHANGE_GAME_MUTATION);
  useSubscription(GAME_STAGE_SUBSCRIPTION, {
    variables: {gameId},
    onSubscriptionData: ({subscriptionData}) => {
      const updatedGame = subscriptionData?.data?.gameStageChange;
      console.log("game subscription state change! ", updatedGame)
      if (updatedGame.stage === 2) {
        console.log("New Round! Navigating to PlayRoom...")
        navigate(`/play-room/${gameId}/${playerId}`)
      }
    }
  })

  useEffect(() => {
    if(gameData?.getGame) {
      setGame(gameData.getGame)
      console.log("SCORE GAME  ", gameData.getGame)
      const totalLikeCounts: Record<string, number> = {};
      const faves = gameData.getGame.rounds.map((round) => {
        if (!round.likes || round.likes.length === 0) return null;
        const likeCounts: Record<string, number> = {};
        for (const like of round.likes) {
            likeCounts[like.gag._id] = (likeCounts[like.gag._id] || 0) + 1;
            totalLikeCounts[like.gag._id] = (totalLikeCounts[like.gag._id] || 0) + 1;
        }
        console.log("likeCounts", likeCounts)
        console.log("totalLikeCounts", totalLikeCounts)
        let mostLikedGagId: string | null = null;
        let maxLikes = 0;
        let hasTie = false;
        for (const [gagId, count] of Object.entries(likeCounts)) {
            if (count > maxLikes) {
                mostLikedGagId = gagId;
                maxLikes = count;
                hasTie = false; // Reset tie flag when a new max is found
            } else if (count === maxLikes) {
                hasTie = true;
            }
        }
        let foundGag = round.gags.find((gag) => gag._id === mostLikedGagId);
        
        return hasTie || !foundGag ? null : foundGag
      })
      console.log("faves", faves)
      setAllLikeCounts(totalLikeCounts)
      if (faves) {
        setFavoriteGags(faves);
      }
      const currentPlayer = gameData.getGame.players.find(p => p._id === playerId) || null;
      if(!currentPlayer) {
        setErrorMessage("You are not a part of this game")
        console.log("You are not a part of this game")
        setTimeout(() => navigate('/'), 5000); // Redirect after 3 seconds
      }
      if (gameData.getGame.stage === 1) {
        navigate(`/waiting-room/${gameData.getGame._id}/${playerId}`)
      } else if (gameData.getGame.stage === 2) {
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

  const handleUpdateGame = async () => {
    if (!gameId) return;
    try {
      await updateGame({variables: { id: gameId, active: true, stage: 2 }})
      console.log("Next Round!")
    } catch (error) {
      console.error("Error starting next round:", error)
      setErrorMessage("Failed to start next round.");
    }
  }

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if(loadingGame) {
    return <LoadingLogo />
  }
  console.log("allLikeCounts", allLikeCounts)

  const calculatePoints = (player: Player) => {
    let points = player.points;
    return points;
  }
  const superlatives = getSuperlatives(game?.players || []);

  return (
    <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
      <Box textAlign="center" alignItems="center"  marginBottom="32px" display="flex" flexDirection="row">
        <Typography color="text.secondary" variant="h3">SCOREBOARD</Typography>
      </Box>
      <Box display="flex" justifyContent="center" flexWrap="wrap">
        {game?.players.map((currPlayer) => {
            const points = calculatePoints(currPlayer);
            return (
                <PlayerCard 
                    key={currPlayer._id} 
                    name={currPlayer?.name || ''}
                    color={currPlayer.color || ''}
                    points={points}
                    icon={currPlayer.icon}
                    emotion={points === 0 ? "sad" : (points > 10 ? "happy" : "neutral")}
                />
            )})}
        </Box>
        {favoriteGags.length > 0 && (
            <Box marginTop="24px">
                <Typography color="text.secondary" variant='h4'>FAVORITE RESPONSES: </Typography>
            </Box>
        )}
        {favoriteGags.map((gag) => {
            if (gag) {
                return (
                    <Box 
                        display="flex" 
                        key={`${gag?._id}-container`} 
                        marginY="8px"
                        justifyContent="space-between"
                        width="320px"
                        alignItems="center"
                        padding="8px" 
                        sx={{
                            border: 1,
                            borderColor: "secondary.main",
                            borderRadius: 1,
                        }}
                    >
                        <Typography color="secondary" textAlign="left" key={`${gag?._id}-gag`}> {gag.text}</Typography>
                        <Box marginLeft="16px">
                            <Typography color="secondary" key={`${gag?._id}-votes`}>{allLikeCounts[gag?._id]}</Typography>
                        </Box>
                    </Box>
                )
            } else {
                return null;
            }
        })}


      {game?.players?.[0]?._id === playerId && (
        <Button onClick={handleUpdateGame} variant='contained' disabled={updateGameLoading} sx={{marginTop: '24px'}}>
          {updateGameLoading ? <CircularProgress size={24}/> : "START NEXT ROUND"}
        </Button>
      )}
        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center" paddingY="16px">
            {Object.entries(superlatives).map(([key, playerId]) => {
                const player = game?.players.find(p => p._id === playerId);
                const details = SUPERLATIVE_DESCRIPTIONS[key as SuperlativeKey];
    
                if (!player || !details) return null; // Skip if player or details are missing
    
                return (
                    <SuperlativeCard player={player} superlative={details.title} description={details.description} emotion={details.emotion as Emotion} />
                );
            })}
        </Box>
      {updateGameError && <Alert severity="error">Error starting game: {updateGameError.message}</Alert>}
    </Box>
  )
}
export default ScoreRoom;