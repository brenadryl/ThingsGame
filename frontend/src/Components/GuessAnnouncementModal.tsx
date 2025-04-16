import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { Box } from '@mui/system';
import PlayerCard from './PlayerCards';
import { AVATAR_LIST } from '../themes/constants';
import { Guess } from '../types';

interface GuessAnnouncementModalProps {
  newGuess: Guess | null;
  playerId: string;
  handleClose: () => void;
}

const GuessAnnouncementModal: React.FC<GuessAnnouncementModalProps> = ({ newGuess, playerId, handleClose }) => {
  const guesser = newGuess?.guesser || null;
  const guessed = newGuess?.guessed || null;
  const selfGuess = guesser?._id === guessed?._id;
  const [delayedAnnouncement, setDelayedAnnouncement] = useState("...")
  const delay = selfGuess ? 0 : 2500;
  useEffect(() => {
    setDelayedAnnouncement("...")
    const timer = setTimeout(() => {
        setDelayedAnnouncement(newGuess?.isCorrect ? "CORRECT!" : "WRONG")
    }, delay)
    return () => clearTimeout(timer);
  }, [delay, newGuess])

  const closeModal = () => {
    handleClose();
  }

  return (
    <Dialog open={newGuess !== null}>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="400px" >
          <Box display="flex" flexDirection="row" alignItems="center">
              { selfGuess ?
                <Box maxWidth="220px" marginY="12px">
                  <PlayerCard name={guesser?.name || ''} color={guesser?.color || ''} icon={guesser?.icon} emotion="happy"/>
                </Box>
                :
                <>
                  <Box maxWidth="220px" marginBottom={delayedAnnouncement === "WRONG" ? "0px" : "12px"} marginTop={delayedAnnouncement === "CORRECT!" ? "0px" : "12px"}>
                    <Box position="relative" maxWidth="220px" marginY="12px">
                      <PlayerCard name={guesser?.name || ''} color={guesser?.color || ''} icon={guesser?.icon} emotion={delayedAnnouncement === "CORRECT!" ? "happy" : (delayedAnnouncement === "WRONG" ? "sad" : "suspicious")}/>
                      {delayedAnnouncement !== "..."  && guesser?.icon !== undefined && <Box
                        position="absolute"
                        top="-20px"
                        right="-60px"
                        bgcolor="text.primary"
                        maxWidth="100px"
                        color="background.default"
                        padding="4px 8px"
                        borderRadius="12px"
                        boxShadow={2}
                        fontSize="9px"
                        fontWeight="bold"
                      >
                        {delayedAnnouncement === "CORRECT!" ? AVATAR_LIST[guesser?.icon].happy_phrase.toUpperCase() : AVATAR_LIST[guesser?.icon].sad_phrase.toUpperCase()}
                      </Box>}
                    </Box>
                  </Box>
                  <Typography>THINKS</Typography>
                  <Box maxWidth="220px" marginBottom={delayedAnnouncement === "CORRECT!" ? "0px" : "12px"} marginTop={delayedAnnouncement === "WRONG" ? "0px" : "12px"}>
                    <Box position="relative" maxWidth="220px" marginY="12px">
                    <PlayerCard name={guessed?.name || ''} color={guessed?.color || ''} icon={guessed?.icon} emotion={delayedAnnouncement === "CORRECT!" ? "sad" : (delayedAnnouncement === "WRONG" ? "happy" : "nervous")}/>
                      {delayedAnnouncement !== "..." && guessed?.icon !== undefined && <Box
                        position="absolute"
                        bottom="19px"
                        left="-50px"
                        bgcolor="text.primary"
                        color="background.default"
                        padding="4px 8px"
                        maxWidth="100px"
                        borderRadius="12px"
                        boxShadow={2}
                        fontSize="9px"
                        fontWeight="bold"
                      >
                        {delayedAnnouncement === "CORRECT!" ? AVATAR_LIST[guessed?.icon].sad_phrase.toUpperCase() : AVATAR_LIST[guessed?.icon].happy_phrase.toUpperCase()}
                      </Box>}
                    </Box>
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
            <Button onClick={closeModal} color="secondary" disabled={delayedAnnouncement === "..."}>CLOSE</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuessAnnouncementModal;



