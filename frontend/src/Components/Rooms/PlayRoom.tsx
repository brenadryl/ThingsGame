import { Alert, Box, Typography} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlayerCard from '../PlayerCards';
import PromptSelection from '../PromptSelection';
import { GameState, useGameStore } from '../../stores/useGameStore';

const PlayRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const game = useGameStore((state: GameState) => state.game);
  const playerList = useGameStore((state: GameState) => state.playerList);

  const currentTurn = playerList.length > 0 ? ((game?.rounds?.length ?? 0) % playerList.length) : 0;
  const currentTurnPlayer = useMemo(() => playerList[currentTurn], [playerList, currentTurn]);

  useEffect(() => {
    if (!gameId || !playerId) {
      setErrorMessage("Invalid Game ID or Player ID")
    }
  }, [gameId, playerId])
  

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if (currentTurnPlayer?._id === playerId) {
    return <PromptSelection gameId={gameId || ''} turn={currentTurn}/>
  }

  return (
    <Box textAlign="center" alignItems="center" display="flex" flexDirection="column">
      <Box textAlign="center" alignItems="center"  marginY="16px" >
        <Typography color="text.secondary">
          {currentTurnPlayer ? `${currentTurnPlayer.name} is choosing a prompt` : "Waiting for player..."}
        </Typography>
      </Box>
      <Box display="flex" justifyContent="center" flexWrap="wrap">
        {playerList.map((currPlayer) => (
          <PlayerCard key={currPlayer._id} name={currPlayer?.name || ''} color={currPlayer.color || ''} icon={currPlayer.icon}/>
        ))}
      </Box>
    </Box>
  )
}
export default PlayRoom;