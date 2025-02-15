import React, { useEffect, useState } from 'react';
import { Guess, Player } from '../types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

interface GuessAnnouncementModalProps {
  hasNewGuess: boolean;
  newGuess: Guess | null;
  handleClose: () => void;
}

const GuessAnnouncementModal: React.FC<GuessAnnouncementModalProps> = ({ hasNewGuess, newGuess, handleClose }) => {
    const [delayedAnnouncement, setDelayedAnnouncement] = useState("...")
    useEffect(() => {
        if (hasNewGuess) {
            setDelayedAnnouncement("...")
            const timer = setTimeout(() => {
                setDelayedAnnouncement(newGuess?.isCorrect ? "CORRECT!" : "WRONG")
            }, 5000)
            return () => clearTimeout(timer);
        }
    }, [hasNewGuess, newGuess])
    if (newGuess === null) return null

  return (
    <Dialog open={hasNewGuess} onClose={() => handleClose}>
      <DialogTitle><strong>{newGuess?.guesser.name}</strong> GUESSED</DialogTitle>
      <DialogContent>
        <Typography>
          <strong>{newGuess?.guessed.name}</strong> SAID
        </Typography>
        <Typography>
          {newGuess?.gag.text}
        </Typography>
        <Typography>
          THIS GUESS WAS
        </Typography>
        <Typography variant='h3' color={delayedAnnouncement === "CORRECT!" ? "info" : "text.primary"}>
            {delayedAnnouncement}
        </Typography>
      </DialogContent>
      <DialogActions>
            <Button onClick={handleClose} color="secondary" disabled={delayedAnnouncement === "..."}>CLOSE</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuessAnnouncementModal;



