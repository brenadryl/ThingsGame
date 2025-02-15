import React from 'react';
import { Gag, Player } from '../types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import PlayerList from './PlayerList';
import { Box } from '@mui/system';

interface ConfirmGuessModalProps {
    isModalOpen: boolean;
    selectedGag: Gag | null;
    selectedPlayer: Player | null;
    handleCloseModal: () => void;
    handleConfirmGuess: () => void;
}

const ConfirmGuessModal: React.FC<ConfirmGuessModalProps> = ({ isModalOpen, selectedGag, selectedPlayer, handleCloseModal, handleConfirmGuess }) => {
    const playerList = selectedPlayer ? [selectedPlayer] : [];
  return (
    <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle variant="h4" color="text.secondary" >CONFIRM YOUR GUESS</DialogTitle>
        <DialogContent>
          <Box textAlign="center" alignItems="center" display="flex" flexDirection="column">
            <Typography>
                ARE YOU SURE YOU WANT TO GUESS THAT
            </Typography>
            <Box maxWidth="230px" marginY="12px">
                <PlayerList playerList={playerList}/>
            </Box>
            <Typography>SAID</Typography>
            <Box maxWidth="230px" marginY="12px">
                <Typography color="secondary" variant='h4'>
                    {selectedGag?.text}
                </Typography>

            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">CANCEL</Button>
          <Button onClick={handleConfirmGuess} color="primary" variant="contained">CONFIRM</Button>
        </DialogActions>
    </Dialog>
  );
};

export default ConfirmGuessModal;



