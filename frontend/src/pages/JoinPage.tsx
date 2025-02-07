import { Box, Button, TextField, useTheme} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const JoinPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const handleSubmit = () => {

    }

  return (
        <form onSubmit={handleSubmit}>
            <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
                <TextField id="name" label="Name" required/>
                <Box marginY="24px">
                    <TextField id="game-code" label="Game Code" required/>
                </Box>
                <Button type="submit" variant="contained">Join</Button>
            </Box>
        </form>
  )
}
export default JoinPage;