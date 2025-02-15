import React, { useEffect, useState } from 'react';
import { Guess, Player } from '../types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import PlayerList from './PlayerList';
import { Box } from '@mui/system';

interface GuessAnnouncementModalProps {
  hasNewGuess: boolean;
  newGuess: Guess | null;
  handleClose: () => void;
  guesser?: Player;
  guessed?: Player;
}

const GuessAnnouncementModal: React.FC<GuessAnnouncementModalProps> = ({ hasNewGuess, newGuess, handleClose, guesser, guessed }) => {
    console.log("newGuess", newGuess)
    const guesserList = guesser ? [guesser] : [];
    const guessedList = guessed ? [guessed] : [];
    const [delayedAnnouncement, setDelayedAnnouncement] = useState("...")
    useEffect(() => {
        if (hasNewGuess) {
            setDelayedAnnouncement("...")
            const timer = setTimeout(() => {
                setDelayedAnnouncement(newGuess?.isCorrect ? "CORRECT!" : "WRONG")
            }, 4000)
            return () => clearTimeout(timer);
        }
    }, [hasNewGuess, newGuess])
    if (newGuess === null) return null

  return (
    <Dialog open={hasNewGuess} onClose={() => handleClose}>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center">
            <Box maxWidth="220px" marginY="12px">
                <PlayerList playerList={guesserList}/>
            </Box>
            <Typography>GUESSED</Typography>
            <Box maxWidth="220px" marginY="12px">
                <PlayerList playerList={guessedList}/>
            </Box>
            <Typography>SAID</Typography>
            <Typography color="secondary" variant='h4'>
            {newGuess?.gag.text}
            </Typography>
            <Typography>
            THIS GUESS WAS
            </Typography>
            <Typography variant='h3' color={delayedAnnouncement === "CORRECT!" ? "info" : "text.primary"}>
                {delayedAnnouncement}
            </Typography>

        </Box>
      </DialogContent>
      <DialogActions>
            <Button onClick={handleClose} color="secondary" disabled={delayedAnnouncement === "..."}>CLOSE</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuessAnnouncementModal;



