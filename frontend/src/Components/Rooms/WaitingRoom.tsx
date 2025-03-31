import { useMutation } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, IconButton, Snackbar, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CHANGE_GAME_MUTATION } from '../../graphql/mutations/gameMutations';
import PlayerList from '../PlayerList';
import AvatarSelection from '../AvatarSelection';
import { GameState, useGameStore } from '../../stores/useGameStore';
import { FaRegCopy } from 'react-icons/fa';


const WaitingRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [mode, setMode] = useState("easy");
  const playerList = useGameStore((state: GameState) => state.playerList)
  const game = useGameStore((state: GameState) => state.game)
  const [startGame, {loading: startLoading, error: startError}] = useMutation(CHANGE_GAME_MUTATION);

  const handleStartGame = async () => {
    if (!gameId) return;
    try {
      await startGame({variables: { id: gameId, active: true, stage: 2, mode }})
      console.log("Game started!")
    } catch (error) {
      console.error("Error starting game:", error)
      setErrorMessage("Failed to start game.");
    }
  }

  const handleToggle = (_event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if(newMode !== null) {
      setMode(newMode)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(game?.gameCode || '');
    setCopyOpen(true);
  };

  const handleClose = () => {
    setCopyOpen(false);
  };

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  return (
    <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" justifyContent="center" gap={1} marginBottom={2}>
        <Typography color="text.secondary">Game Code:</Typography>
        <Box display="flex" alignItems="flex-start">
          <Typography 
            color="info" 
            variant="h3" 
            sx={{ cursor: 'pointer' }} 
            onClick={handleCopy}
          >
            {game?.gameCode}
          </Typography>
          <IconButton size="small" color="info" sx={{ paddingTop: 0}} onClick={handleCopy}>
            <FaRegCopy fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {game?.players?.[0]?._id === playerId && (
        <>
          <Button onClick={handleStartGame} variant='contained' disabled={startLoading} sx={{marginBottom: '16px'}}>
            {startLoading ? <CircularProgress size={24}/> : <Typography variant="h2" color="primary.contrastText">START GAME</Typography>}
          </Button>

          <Box marginBottom="16px" display="flex" flexDirection="column" alignItems="center">
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleToggle}
              sx={{
                borderRadius: "50px",
                overflow: "hidden",
                backgroundColor: "info.main",
                "& .MuiToggleButton-root": {
                  border: "none",
                  padding: "8px 20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textTransform: "none",
                  transition: "0.3s",
                  "&.Mui-selected": {
                    backgroundColor: "info.main",
                    color: "white",
                  },
                  "&:not(.Mui-selected)": {
                    backgroundColor: "grey",
                    color: "white",
                  },
                },
              }}
            >
              <ToggleButton value="easy" sx={{ width: "100px"}}>EASY</ToggleButton>
              <ToggleButton value="standard" sx={{ width: "100px"}}>STANDARD</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </>
      )}
      {startError && <Alert severity="error">Error starting game: {startError.message}</Alert>}
      <PlayerList playerList={playerList}/>
      {playerList.find(p => p._id === playerId) && (<AvatarSelection playerId={playerId || ''} gameId={gameId || ''} currentAvatarIndex={playerList.find(p => p._id === playerId)?.icon ?? null} playerList={playerList}/>)}
      <Snackbar
        open={copyOpen}
        autoHideDuration={2000}
        onClose={handleClose}
        message="Copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
export default WaitingRoom;