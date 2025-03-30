import React from 'react';
import { Gag, Player } from '../types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import PlayerList from './PlayerList';
import { Box } from '@mui/system';
import PlayerCard from './PlayerCards';

interface ConfirmGuessModalProps {
    isModalOpen: boolean;
    selectedGag: Gag | null;
    selectedPlayer: Player | null;
    handleCloseModal: () => void;
    handleConfirmGuess: () => void;
}

const ConfirmGuessModal: React.FC<ConfirmGuessModalProps> = ({ isModalOpen, selectedGag, selectedPlayer, handleCloseModal, handleConfirmGuess }) => {
  return (
    <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle variant="h4" color="text.secondary" textAlign="center" sx={{paddingBottom: "4px"}}>CONFIRM YOUR GUESS</DialogTitle>
        <DialogContent>
          <Box textAlign="center" alignItems="center" display="flex" flexDirection="column">
            <Typography variant="body1" color="text.secondary">
                ARE YOU SURE YOU WANT TO GUESS THAT
            </Typography>
            <Box maxWidth="230px" marginTop="12px">
              <PlayerCard name={selectedPlayer?.name || ''} color={selectedPlayer?.color || ''} icon={selectedPlayer?.icon} emotion="nervous"/>
            </Box>
            <Typography variant="body1" color="text.secondary">SAID</Typography>
            <Box maxWidth="230px" marginBottom="12px" marginTop="8px">
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

export default React.memo(ConfirmGuessModal, (prev, next) => {
  return prev.isModalOpen === next.isModalOpen;
});



