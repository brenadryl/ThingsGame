import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, TextField} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_PROMPTS, GET_RANDOM_PROMPTS, GetRandomPromptsData } from '../graphql/queries/promptQueries';
import { Prompt } from '../types';
import { ADD_PLAYER } from '../graphql/mutations/playerMutations';

const JoinPage: React.FC = () => {
    const { loading: loadingRandom, error: errorRandom, data: randomData } = useQuery<GetRandomPromptsData>(GET_RANDOM_PROMPTS);
    const { loading: loadingAll, error: errorAll, data: allData } = useQuery<GetRandomPromptsData>(GET_PROMPTS);
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
          navigate(`/waiting-room/${player.game._id}/${player._id}`);
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
        <div>
      <h1>GraphQL Prompts</h1>

      {/* Random Prompts Section */}
      <h2>Random Prompts</h2>
      {loadingRandom && <p>Loading...</p>}
      {errorRandom && <p>Error: {errorRandom.message}</p>}
      <ul>
        {randomData?.getRandomPrompts.map((prompt: Prompt) => (
          <li key={prompt._id}>{prompt.text}</li>
        ))}
      </ul>

      {/* All Prompts Section */}
      <h2>All Prompts</h2>
      {loadingAll && <p>Loading...</p>}
      {errorAll && <p>Error: {errorAll.message}</p>}
      <ul>
        {allData?.prompts.map((prompt: Prompt) => (
          <li key={prompt._id}>{prompt.text}</li>
        ))}
      </ul>
    </div>
        </>
  )
}
export default JoinPage;