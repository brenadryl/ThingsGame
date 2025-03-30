import { Alert, Box, Typography} from '@mui/material';
import React, { useState } from 'react';
import PlayerSelection from '../PlayerSelection';
import { useGagSubscription } from '../../Hooks/useGagSubscription';
import { useGameStore } from '../../stores/useGameStore';
import { useQuery } from '@apollo/client';
import { GET_GAGS, GetGagsData } from '../../graphql/queries/gagQueries';
import LoadingLogo from '../LoadingLogo';
import { sortGags } from '../../utils/gameUtils';

 
const SubmittedRoom: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const playerList = useGameStore((state) => state.playerList)
  const currentRound = useGameStore((state) => state.currentRound)
  const gagList = useGameStore((state) => state.gagList)
  const setGagList = useGameStore((state) => state.setGagList)
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
  
  return (
    <>
      <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
        <Box textAlign="center" alignItems="center"  marginBottom="32px" marginTop="8px">
          <Typography color="info" variant="h3">{currentRound?.promptText}</Typography>
          <Typography variant="h5">{playerList.length === gagList?.length ? "ALL PLAYERS IN" : "WAITING FOR PLAYERS"}</Typography>
        </Box>
        <PlayerSelection playerList={playerList|| []} gagList={gagList || []} onClick={() => {}}/>
      </Box>
    </>
  )
}
export default SubmittedRoom;