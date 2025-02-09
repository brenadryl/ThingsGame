import { useMutation } from '@apollo/client';
import { Alert, Box, Button, TextField} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CREATE_GAME } from '../graphql/mutations/gameMutations';
import { ADD_PLAYER } from '../graphql/mutations/playerMutations';

const HostPage: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [createGame] = useMutation(CREATE_GAME);
    const [createPlayer] = useMutation(ADD_PLAYER);
    const regex = /^[A-Za-z]+$/;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const inputName = event.target.value;
      if (inputName.length === 0 || (regex.test(inputName) && inputName.length < 12)) {
        setName(inputName.toUpperCase());
      }

    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null)
        setLoading(true)
        if(!name.trim()){
          setErrorMessage("Name is required!");
          setLoading(false);
          return;
        }
        if(name.trim().length < 3){
          setErrorMessage("Entered name is too short");
          setLoading(false);
          return;
        }
    
        try {
          const { data: gameData } = await createGame();
    
          if (gameData?.createGame) {
            console.log(gameData)
            const game = gameData.createGame;
            const gameCode = game.gameCode;
    
            // Create the player with the provided name and associated gameId
            const { data: playerData } = await createPlayer({
              variables: { name, gameCode },
            });
    
            if (playerData?.createPlayer) {
              const player = playerData.createPlayer;
              navigate(`/waiting-room/${game._id}/${player._id}`);
            }
          }
        } catch (error: any) {
          console.error('Error creating game or player:', error);
          setErrorMessage(error.message || "An unexpected error occured.")
        } finally {
          setLoading(false)
        }
      };

  return (
    <form onSubmit={handleSubmit}>
        <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
          {errorMessage && <Alert severity="error" sx={{ mb: 2}}> {errorMessage}</Alert>}
            <TextField 
                label="Name" 
                required
                value={name} 
                onChange={handleChange} 
                variant="outlined"
            />
            <Box marginY="24px">
                <Button type="submit" variant="contained">HOST</Button>
            </Box>
        </Box>
    </form>
  )
}
export default HostPage;