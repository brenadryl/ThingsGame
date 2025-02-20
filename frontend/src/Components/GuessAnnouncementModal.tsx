import React, { useEffect, useState } from 'react';
import { Guess, Player } from '../types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import PlayerList from './PlayerList';
import { Box } from '@mui/system';
import PlayerCard from './PlayerCards';

interface GuessAnnouncementModalProps {
  hasNewGuess: boolean;
  newGuess: Guess | null;
  handleClose: () => void;
}

const GuessAnnouncementModal: React.FC<GuessAnnouncementModalProps> = ({ hasNewGuess, newGuess, handleClose }) => {
    const guesser = newGuess?.guesser || null;
    const guessed = newGuess?.guessed || null;
    const selfGuess = guesser?._id === guessed?._id;
    const [delayedAnnouncement, setDelayedAnnouncement] = useState("...")
    const delay = selfGuess ? 0 : 4000;
    useEffect(() => {
        if (hasNewGuess) {
            setDelayedAnnouncement("...")
            const timer = setTimeout(() => {
                setDelayedAnnouncement(newGuess?.isCorrect ? "CORRECT!" : "WRONG")
            }, delay)
            return () => clearTimeout(timer);
        }
    }, [hasNewGuess, newGuess, delay])
    if (newGuess === null) return null

  return (
    <Dialog open={hasNewGuess} onClose={() => handleClose}>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box display="flex" flexDirection="row" alignItems="center">
              { selfGuess ?
                <Box maxWidth="220px" marginY="12px">
                  <PlayerCard name={guesser?.name || ''} color={guesser?.color || ''} icon={guesser?.icon} emotion="happy"/>
                </Box>
                :
                <>
                  <Box maxWidth="220px" marginBottom={delayedAnnouncement === "WRONG" ? "0px" : "12px"} marginTop={delayedAnnouncement === "CORRECT!" ? "0px" : "12px"}>
                    <PlayerCard name={guesser?.name || ''} color={guesser?.color || ''} icon={guesser?.icon} emotion={delayedAnnouncement === "CORRECT!" ? "happy" : (delayedAnnouncement === "WRONG" ? "sad" : "suspicious")}/>
                  </Box>
                  <Typography>THINKS</Typography>
                  <Box maxWidth="220px" marginBottom={delayedAnnouncement === "CORRECT!" ? "0px" : "12px"} marginTop={delayedAnnouncement === "WRONG" ? "0px" : "12px"}>
                    <PlayerCard name={guessed?.name || ''} color={guessed?.color || ''} icon={guessed?.icon} emotion={delayedAnnouncement === "CORRECT!" ? "sad" : (delayedAnnouncement === "WRONG" ? "happy" : "nervous")}/>
                  </Box>
                </>
              }
            </Box>
            <Typography>SAID</Typography>
            <Typography color="secondary" variant='h4' textAlign="center">
            {newGuess?.gag.text}
            </Typography>
            <Typography>
            THIS GUESS WAS
            </Typography>
            <Typography variant='h2' color={delayedAnnouncement === "CORRECT!" ? "info" : "text.primary"}>
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



