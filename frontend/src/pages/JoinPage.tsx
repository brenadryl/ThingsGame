import { useMutation } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, TextField} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADD_PLAYER } from '../graphql/mutations/playerMutations';

const JoinPage: React.FC = () => {
    const [createPlayer, {loading: creatingPlayer}] = useMutation(ADD_PLAYER);
    const [name, setName] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const regex = /^[A-Za-z]+$/;

    const validateText = (text: string, limit: number) => {
      if (text.length === 0 || (regex.test(text) && text.length < limit)) {
        return text.toUpperCase();
      }
      return undefined;
    }

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const input = validateText(event.target.value, 12);
      if (input !== undefined) {
        setName(input);
      }
    }

    const handleGameCodeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const input = validateText(event.target.value, 7);
      if (input !== undefined) {
        setGameCode(input);
      }
    }

    
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null)

      if (!name.trim() || !gameCode.trim()){
        setErrorMessage("Both Name and Game Code are required.")
      }
  
      try {
        const { data: playerData } = await createPlayer({
          variables: { name, gameCode },
        });

        if (playerData && playerData.createPlayer) {
          const player = playerData.createPlayer;
          navigate(`/game/${player.game._id}/${player._id}`);
        }
      } catch (error: any) {
        console.error('Error creating player:', error);
        setErrorMessage(error.message || "An unexpected error occurred");
      }
    };

  return (
    <>
        <form onSubmit={handleSubmit}>
            <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
              {errorMessage && <Alert severity="error" sx={{ mb: 2}}> {errorMessage}</Alert>}
                <TextField 
                  id="name" 
                  label="Name" 
                  required
                  autoFocus
                  value={name} 
                  onChange={handleNameChange} 
                />
                <Box marginY="24px">
                    <TextField 
                      id="game-code" 
                      label="Game Code" 
                      required
                      value={gameCode} 
                      onChange={handleGameCodeChange} 
                    />
                </Box>
                <Button type="submit" variant="contained" disabled={creatingPlayer}>
                  {creatingPlayer ? <CircularProgress size={24}/> : "JOIN"}
                </Button>
            </Box>
        </form>
      </>
  )
}
export default JoinPage;