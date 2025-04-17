import { Alert, Box, Typography} from '@mui/material';
import React, { useState } from 'react';
import PlayerSelection from '../PlayerSelection';
import { useGagSubscription } from '../../Hooks/useGagSubscription';
import { GameState, useGameStore } from '../../stores/useGameStore';
import { useQuery } from '@apollo/client';
import { GET_GAGS, GetGagsData } from '../../graphql/queries/gagQueries';
import LoadingLogo from '../LoadingLogo';
import { sortGags } from '../../utils/gameUtils';
import { useParams } from 'react-router-dom';
import GameMenu from '../GameMenu';
import CountdownTimer from '../CountdownTimer';

 
const SubmittedRoom: React.FC = () => {
  const { playerId } = useParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const playerList = useGameStore((state: GameState) => state.playerList)
  const game = useGameStore((state: GameState) => state.game)
  const currentRound = useGameStore((state: GameState) => state.currentRound)
  const gagList = useGameStore((state: GameState) => state.gagList)
  const setGagList = useGameStore((state: GameState) => state.setGagList)
  const { loading: loadingGags, error: errorGags } = useQuery<GetGagsData>(GET_GAGS, {
    variables: { roundId: currentRound?._id },
    skip: !currentRound?._id,
    fetchPolicy: 'network-only',
    onCompleted(data) {
      if (!!data?.getGags) {
        setGagList(sortGags(data.getGags));
      }
    },
  });

  useGagSubscription(setErrorMessage);

  if (errorGags) {
    return <Alert severity="error">{errorGags.message}</Alert>
  }

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }
  if (loadingGags) return <LoadingLogo />
  const roundCount = currentRound ? (currentRound?.turn + 1) :  (game?.rounds?.length ?? 0);
  console.log("currentRound", currentRound)

  return (
    <>
      { playerId !== "spectator" ? <Box position="relative" width="100%" display="flex" alignItems="center">
        <Typography
          variant="h3"
          color="info.main"
          sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
        >
          {`ROUND ${roundCount}`}
        </Typography>
        <Box sx={{ marginLeft: 'auto' }}>
          <GameMenu />
        </Box>
      </Box> :
      <Box>
        <Typography
          variant="h3"
          color="info.main"
        >
          {`ROUND ${roundCount}`}
        </Typography>
        <Typography variant="body1" > SPECTATOR VIEW </Typography>
      </Box>
      }
      <Box textAlign="center" alignItems="center"  marginTop="8px" display="flex" flexDirection="column">
        <Box textAlign="center" alignItems="center"  marginBottom="12px">
          <Typography color="info" variant="h3">{currentRound?.promptText}</Typography>
          <Typography variant="h5" paddingBottom="8px">{playerList.length === gagList?.length ? "ALL PLAYERS IN" : "WAITING FOR PLAYERS"}</Typography>
          <CountdownTimer createdAt={currentRound?.createdAt || 1} />
        </Box>
        <PlayerSelection playerList={playerList|| []} gagList={gagList || []} onClick={() => {}}/>
      </Box>
    </>
  )
}
export default SubmittedRoom;