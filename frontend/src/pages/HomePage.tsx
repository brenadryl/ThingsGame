import { Box, Button, Typography, useTheme} from '@mui/material';
import React from 'react';
import GradientButton from '../Components/GradientButton';
import { useNavigate } from 'react-router-dom';
import { HOME_LOGO } from '../themes/constants';

const HomePage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

  return (
    <Box textAlign="center" alignItems="center" display="flex" flexDirection="column">
      {/* <Box margin="auto" maxWidth="300px" paddingY="50px">
                  <img src={LOADING_GIF}  alt="JOAKS ON YOU" style={{ maxWidth: '300px', height: 'auto' }} /> 
              </Box> */}
        <Box paddingTop="24px" paddingBottom="8px">
          <img src={HOME_LOGO}  alt="JOAKS ON YOU" style={{ maxWidth: '270px', height: 'auto' }} /> 
        </Box>
        
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
        <Box marginY="12px">
            <Button variant="text" color="info" onClick={()=> navigate('/spectator-join')}> 
              <Typography variant="body2" color='info'>WATCH GAME</Typography>
            </Button>
        </Box>
    </Box>
  )
}
export default HomePage;