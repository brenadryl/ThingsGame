import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface SlapDownProps {
  children: React.ReactNode;
  delay?: number;
  }

const SlapDown: React.FC<SlapDownProps> = ({ children, delay = 1.5 }) => {
  return (
    <MotionBox
      initial={{ y: -200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 700,
        damping: 30,
        duration: 0.8,
        delay,
      }}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: 1,
      }}
    >
      {children}
    </MotionBox>
  );
};

export default SlapDown;