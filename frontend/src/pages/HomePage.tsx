import { Box, Button, Typography, useTheme} from '@mui/material';
import React from 'react';
import GradientButton from '../Components/GradientButton';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

  return (
    <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
        
        <GradientButton
            onClick={()=> navigate('/join')}
            firstColor={theme.palette.primary.main}
            secondColor={theme.palette.secondary.main}
          >
                <Typography variant="h3" color='primary.contrastText'>JOIN GAME</Typography>
        </GradientButton>
        <Box marginTop="24px">
            <Button variant="contained" color="info" onClick={()=> navigate('/host')}> HOST GAME</Button>
        </Box>
    </Box>
  )
}
export default HomePage;