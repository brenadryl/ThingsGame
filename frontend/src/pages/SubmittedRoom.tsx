import { useQuery } from '@apollo/client';
import { Alert, Box, Typography} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Gag, Game } from '../types';
import { useSubscription } from '@apollo/client';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { GAG_UPDATE_SUBSCRIPTION } from '../graphql/subscriptions/gagSubscriptions';
import PlayerSelection from '../Components/PlayerSelection';
import LoadingLogo from '../Components/LoadingLogo';

 
const SubmittedRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const navigate = useNavigate();
  const processedGameData = useRef(false);
  const [game, setGame] = useState<Game | null>(null)
  const [gagList, setGagList] = useState<Gag[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading: loadingGame, error: errorGame, data: gameData } = useQuery<GetGameData>(GET_GAME, {
    variables: {id: gameId},
    skip: !gameId,
    fetchPolicy: "network-only",
  });
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
    }
  });

  useEffect(() => {
    if (gagList.length > 0 && (game?.players.length || 0) > 0 &&  gagList.length === game?.players.length) {

      setTimeout(() => navigate(`/guessing-room/${gameId}/${playerId}`), 1000); // Redirect after 3 seconds
    }
  }, [game, gagList, gameId, playerId, navigate])

  useEffect(() => {
    if(gameData?.getGame && !processedGameData.current) {
      processedGameData.current = true;
      setGame(gameData.getGame)
      if (gameData.getGame.currentRound.gags.length > gagList.length) {
        setGagList(gameData.getGame.currentRound.gags)
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
    } 
  }, [gameId, playerId, errorGame, errorSubscription])

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if(loadingGame) {
    return <LoadingLogo />
  }
  
  return (
    <>
      <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
        <Box textAlign="center" alignItems="center"  marginBottom="32px" marginTop="8px">
          <Typography color="info" variant="h3">{game?.currentRound.promptText}</Typography>
        </Box>
        <PlayerSelection playerList={game?.players || []} gagList={gagList || []} onClick={() => {}}/>
      </Box>
    </>
  )
}
export default SubmittedRoom;