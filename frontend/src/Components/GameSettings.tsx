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
    const setMode = useGameStore((state: GameState) => state.setMode)
    
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
                        py: 4,
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
                            // width: 325,
                            width: 250,
                            justifyContent: "flex-end",
                            my: 2,
                        }}
                        display="flex" 
                        alignItems="center" 
                        flexDirection="row"
                    >
                        <Typography color="warning.contrastText" variant="button" marginRight="32px"> MODE </Typography>
                        <Button sx={{ my: 0, px: 1.5, py: 1, borderRadius: 4}} variant={mode === "easy" ? "contained" : "text"} onClick={handleEasyClick}>EASY</Button>
                        <Button sx={{ my: 0, px: 1.5, py: 1, borderRadius: 4}} variant={mode === "standard" ? "contained" : "text"} onClick={handleStandardClick}>STANDARD</Button>
                        {/* <Button sx={{ my: 0, px: 1.5, py: 1, borderRadius: 4}} variant={mode === "brutal" ? "contained" : "text"} onClick={handleBrutalClick}>BRUTAL</Button> */}
                    </Box>
                    {/* <Box 
                        sx={{
                            bgcolor: 'success.light',
                            borderRadius: 4,
                            boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.1), inset 0 -4px 6px rgba(0,0,0,0.06)',
                            paddingLeft: 2,
                            width: 325,
                            justifyContent: "flex-end",
                            my: 2,
                        }}
                        display="flex" 
                        alignItems="center" 
                        flexDirection="row"
                    >
                        <Typography color="warning.contrastText" variant="button" marginRight="16px"> TIMER </Typography>
                        <Button sx={{ width: 80, my: 0, px: 1.5, py: 1, borderRadius: 4}} variant={mode === "brutal" ? "contained" : "text"} onClick={handleBrutalClick}>OFF</Button>
                        <Button sx={{ width: 90, my: 0, px: 1.5, py: 1, borderRadius: 4}} variant={mode === "easy" ? "contained" : "text"} onClick={handleEasyClick}>1 MIN</Button>
                        <Button sx={{ width: 90, my: 0, px: 1.5, py: 1, borderRadius: 4}} variant={mode === "standard" ? "contained" : "text"} onClick={handleStandardClick}>2 MIN</Button>
                    </Box> */}
                </Box>
            </Modal>
        </Box>
    );
};

export default GameSettings;