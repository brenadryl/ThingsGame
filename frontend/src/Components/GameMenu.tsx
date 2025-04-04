import React, { useEffect, useState } from 'react';
import { Drawer, IconButton, Box, Typography, Snackbar, Button, CircularProgress, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { FaRegCopy } from 'react-icons/fa';
import { GameState, useGameStore } from '../stores/useGameStore';
import { useMutation } from '@apollo/client';
import { CHANGE_GAME_MUTATION } from '../graphql/mutations/gameMutations';

const GameMenu = () => {
    const [open, setOpen] = useState(false);
    const [copyOpen, setCopyOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const game = useGameStore((state: GameState) => state.game)
    const [updateGame, {loading: updateGameLoading, error: updateGameError}] = useMutation(CHANGE_GAME_MUTATION);

    const toggleDrawer = (state: boolean) => () => {
        setOpen(state);
    };
    useEffect(() => {
      if (updateGameError) {
        setErrorMessage(updateGameError.message)
      }
    }, [updateGameError])
  
    const handleEndGame = async () => {
      if (!game?._id) return;
      try {
        await updateGame({variables: { id: game._id, active: false, stage: 3 }})
        console.log("Game Ended!")
      } catch (error) {
        console.error("Error ending game:", error)
        setErrorMessage("Failed to end game.");
      }
    }

    const handleCloseCopy = () => {
        setCopyOpen(false);
    };
    const handleCopy = () => {
        navigator.clipboard.writeText(game?.gameCode || '');
        setCopyOpen(true);
    };

    if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
    }

    return (
        <Box>
        <IconButton edge="start" color="info" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
        </IconButton>

        <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
            <Box
            sx={{ width: 250 }}
            role="presentation"
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding="8px"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
            >
                <Typography color="info" variant="h2"> GAME MENU</Typography>
                <Box display="flex" alignItems="flex-start" marginTop="16px">
                    <Typography paddingTop="4px">CODE</Typography>
                    <Typography 
                        variant="h4" 
                        sx={{ cursor: 'pointer' }} 
                        onClick={handleCopy}
                    >
                        {`: ${game?.gameCode}`}
                    </Typography>
                    <IconButton size="small" sx={{ paddingTop: 0}} onClick={handleCopy}>
                        <FaRegCopy fontSize="small" />
                    </IconButton>
                </Box>
                <Box textAlign="center">
                    <Button onClick={handleEndGame} color="error" variant='contained' disabled={updateGameLoading} sx={{marginTop: '24px'}}>
                    {updateGameLoading ? <CircularProgress size={24}/> : "END GAME"}
                    </Button>
                </Box>
            </Box>
        </Drawer>
        <Snackbar
                open={copyOpen}
                autoHideDuration={2000}
                onClose={handleCloseCopy}
                message="Copied to clipboard!"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
};

export default GameMenu;