import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { GameState, useGameStore } from '../../stores/useGameStore';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const DURATION = 0.5; // Duration of each animation in seconds

const SubmittedTransition: React.FC = () => {
  const gagList = useGameStore((state: GameState) => state.gagList);
  const currentRound = useGameStore((state: GameState) => state.currentRound);
  const setRoom = useGameStore((state: GameState) => state.setRoom);

  useEffect(() => {
    const totalDelay = (gagList.length - 1) * 0.3 + DURATION + 3;
    const timeoutId = setTimeout(() => {
      setRoom("guessing");
    }, totalDelay * 1000);

    return () => clearTimeout(timeoutId);
  }, [gagList, setRoom]);

  return (
    <Box textAlign="center" alignItems="center" marginTop="8px" display="flex" flexDirection="column">
      <Typography sx={{ padding: 1 }}>{currentRound?.promptText}</Typography>
      {gagList.map((currGag, index) => (
        <MotionBox
          key={currGag.text + index}
          marginY={1}
          padding={1}
          bgcolor="secondary.main"
          width="330px"
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: index * 0.3,
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          sx={{
            borderRadius: 1,
            border: '2px solid',
            borderColor: 'secondary.main',
          }}
        >
          <Typography>{currGag.text}</Typography>
        </MotionBox>
      ))}
    </Box>
  );
};

export default SubmittedTransition;