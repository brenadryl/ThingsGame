import React, { useState, useEffect } from 'react';
import { GameState, useGameStore } from '../stores/useGameStore';
import { Box, Typography } from '@mui/material';

interface CountdownTimerProps {
  createdAt: number;
}

/**
 * CountdownTimer
 *
 * Displays a mm:ss countdown, changing color as time elapses:
 *  >50% remaining: green
 *  25-50% remaining: orange
 *  <25% remaining: red
 */
const CountdownTimer: React.FC<CountdownTimerProps> = ({ createdAt }) => {
  const game = useGameStore((state: GameState) => state.game);
  const duration = (game?.minutes || 5) * 60;

  const [remaining, setRemaining] = useState<number>(duration);

  useEffect(() => {
    const endTime = createdAt * 1000 + duration * 1000;

    const updateRemaining = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((endTime - now) / 1000));
      setRemaining(diff);
    };

    // update immediately and then every second
    updateRemaining();
    const timerId = setInterval(updateRemaining, 1000);

    return () => clearInterval(timerId);
  }, [createdAt, duration]);

  // format mm:ss
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const paddedSeconds = String(seconds).padStart(2, '0');

  // determine color thresholds
  const pct = remaining / duration;
  let color = '#00C986FF';
  if (pct <= 0.25) {
    color = '#FF3F34';
  } else if (pct <= 0.5) {
    color = '#FFA735FF';
  }

  return (
    <Box display="flex" width="100%" textAlign="center" justifyContent="center" alignItems="center">
        <Typography
            variant='h2'
            sx={{
                color,
                // borderColor: color,
                // border: '2px solid',
                // width: '100px',
                // borderRadius: '8px'
            }}
        >
        {minutes}:{paddedSeconds}
        </Typography>
    </Box>
  );
};

export default CountdownTimer;
