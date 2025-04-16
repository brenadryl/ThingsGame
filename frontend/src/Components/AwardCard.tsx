import React from 'react';
import { Box, Typography } from '@mui/material';
import SlapDown from './SlapDown';

interface AwardCardProps {
  children: React.ReactNode;
  title: string;
  description: string;
  }

const AwardCard: React.FC<AwardCardProps> = ({ children, title, description }) => {
  return (
    <Box marginTop="12px">
        <SlapDown delay={0.2}>
            <Typography color="info" variant="h2">{title}</Typography>
        </SlapDown>
        <SlapDown delay={0.8}>
            <Typography marginTop="-8px" color="text.secondary" variant="body1">{description}</Typography>
        </SlapDown>
        <SlapDown delay={2}>
            {children}
        </SlapDown>
    </Box>
  );
};

export default AwardCard;