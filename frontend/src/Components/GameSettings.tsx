import React, { useEffect, useState } from 'react';
import { Drawer, IconButton, Box, Typography, Alert, Button, Modal } from '@mui/material';
import { FaGear } from "react-icons/fa6";
import { GameState, useGameStore } from '../stores/useGameStore';
interface GameSettingsProps {
}

const GameSettings = ({}: GameSettingsProps) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const mode = useGameStore((state: GameState) => state.mode)
    const minutes = useGameStore((state: GameState) => state.minutes)
    const setMode = useGameStore((state: GameState) => state.setMode)
    const setMinutes = useGameStore((state: GameState) => state.setMinutes)

    const handleOneClick = () => {
        setMinutes(1)
    }
    const handleTwoClick = () => {
        setMinutes(2)
    }
    const handleFiveClick = () => {
        setMinutes(5)
    }
    
    const handleEasyClick = () => {
        setMode("easy")
    }
    const handleStandardClick = () => {
        setMode("standard")
    }
    const handleBrutalClick = () => {
        setMode("brutal")
    }

    return (
        <Box>
            <IconButton edge="start" color="info" aria-label="menu" onClick={handleOpen}>
                <FaGear />
            </IconButton>

            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 350,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        py: 5,
                    }}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                >
                    <Typography sx={{ marginBottom: 1 }} color="info" variant="h2"> SETTINGS</Typography>
                    <Box 
                        sx={{
                            bgcolor: 'success.light',
                            borderRadius: 4,
                            boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.1), inset 0 -4px 6px rgba(0,0,0,0.06)',
                            paddingLeft: 2,
                            width: 300,
                            justifyContent: "space-between",
                            my: 2,
                        }}
                        display="flex" 
                        alignItems="center" 
                        flexDirection="row"
                    >
                        <Typography color="warning.contrastText" variant="button" marginRight="16px"> TIMER </Typography>
                        <Button sx={{ my: 0, px: 2, py: 1, borderRadius: 4}} variant={minutes === 1 ? "contained" : "text"} onClick={handleOneClick}>1 MIN</Button>
                        <Button sx={{ my: 0, px: 2, py: 1, borderRadius: 4}} variant={minutes === 2 ? "contained" : "text"} onClick={handleTwoClick}>2 MIN</Button>
                        <Button sx={{ my: 0, px: 2, py: 1, borderRadius: 4}} variant={minutes === 5 ? "contained" : "text"} onClick={handleFiveClick}>5 MIN</Button>
                    </Box>
                    <Box 
                        sx={{
                            bgcolor: 'success.light',
                            borderRadius: 4,
                            boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.1), inset 0 -4px 6px rgba(0,0,0,0.06)',
                            paddingLeft: 2,
                            width: 300,
                            justifyContent: "space-between",
                            my: 2,
                        }}
                        display="flex" 
                        alignItems="center" 
                        flexDirection="row"
                    >
                        <Typography color="warning.contrastText" variant="button" marginRight="32px"> MODE </Typography>
                        <Button sx={{ my: 0, px: 2, py: 1, borderRadius: 4}} variant={mode === "easy" ? "contained" : "text"} onClick={handleEasyClick}>STANDARD</Button>
                        <Button sx={{ my: 0, px: 2, py: 1, borderRadius: 4}} variant={mode === "standard" ? "contained" : "text"} onClick={handleStandardClick}>BRUTAL</Button>
                        {/* <Button sx={{ my: 0, px: 1.5, py: 1, borderRadius: 4}} variant={mode === "brutal" ? "contained" : "text"} onClick={handleBrutalClick}>BRUTAL</Button> */}
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default GameSettings;