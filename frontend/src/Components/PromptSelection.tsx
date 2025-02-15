import { useMutation, useQuery } from '@apollo/client';
import { Alert, Button, CircularProgress, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { GET_RANDOM_PROMPTS, GetRandomPromptsData } from '../graphql/queries/promptQueries';
import { Prompt } from '../types';
import { Box } from '@mui/system';
import { NEW_ROUND } from '../graphql/mutations/roundMutations';

interface PromptSelectionProps {
  gameId: string;
  turn: number;
}

const PromptSelection: React.FC<PromptSelectionProps> = ({ gameId, turn }) => {
    const { loading, error, data } = useQuery<GetRandomPromptsData>(GET_RANDOM_PROMPTS);
    const [selectedPrompt, setSelectedPrompt] = useState('');
    const [customPrompt, setCustomPrompt] = useState('THINGS ')
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [startRound, {loading: startLoading, error: startError}] = useMutation(NEW_ROUND);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
          const inputPrompt = event.target.value;
          if (inputPrompt.startsWith('THINGS ')) {
            setCustomPrompt(inputPrompt.toUpperCase());
            setSelectedPrompt(inputPrompt.toUpperCase())
          } else if (inputPrompt.length === 0) {
            setCustomPrompt('THINGS ');
            setSelectedPrompt('THINGS ')
          }
    
        }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null)
        if (!gameId) return;

        if (selectedPrompt === ''){
            setErrorMessage("Select a prompt")
        } else if (selectedPrompt.length < 12){
            setErrorMessage("Prompt is not long enough")
        } else {
            try {
              await startRound({variables: { gameId, promptText: selectedPrompt, turn}})
              console.log("Round started!")
            } catch (error) {
              console.error("Error starting round:", error)
              setErrorMessage("Failed to start round.");
            }
        }
    
        // try {
        // const { data: playerData } = await createPlayer({
        //     variables: { name, gameCode },
        // });

        // if (playerData && playerData.createPlayer) {
        //     const player = playerData.createPlayer;
        //     navigate(`/waiting-room/${player.game._id}/${player._id}`);
        // }
        // } catch (error: any) {
        // console.error('Error creating player:', error);
        // setErrorMessage(error.message || "An unexpected error occurred");
        // }
    };

    
  return ( 
    <>
        <form onSubmit={handleSubmit}>

        <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
            <Box marginBottom="24px">
                <Typography variant="h3"> SELECT A PROMPT</Typography>
            </Box>
          {errorMessage && <Alert severity="error" sx={{ mb: 2}}> {errorMessage}</Alert>}
          {data?.getRandomPrompts.map((prompt: Prompt) => (
                <Box marginBottom="16px">
                  <Button 
                    key={prompt._id} 
                    variant="contained"
                    color={selectedPrompt === prompt.text.toUpperCase() ? "primary" : "info"}
                    onClick={() => setSelectedPrompt(prompt.text.toUpperCase())}
                    sx={{
                        pointerEvents: selectedPrompt === prompt.text.toUpperCase() ? "none" : "auto",
                        opacity: selectedPrompt === prompt.text.toUpperCase() ? 1 : 1,
                        width: "260px",
                        borderRadius: 1,
                    }}
                  >
                    {prompt.text.toUpperCase()}
                  </Button>
                </Box>
            ))}

            <Box marginY="16px">
                <TextField 
                    label="Write your own"
                    required
                    value={customPrompt} 
                    onClick={() => setSelectedPrompt(customPrompt)}
                    onChange={handleChange} 
                    variant="outlined"
                    sx= {{
                        width: "260px",
                    }}
                />
            </Box>

            <Box marginY="16px">
                <Button type="submit" variant="contained" color="secondary" disabled={startLoading}>{startLoading ? <CircularProgress /> : 'START ROUND'}</Button>
            </Box>
            {startError && <Alert severity="error">Error starting round: {startError.message}</Alert>}
        </Box>

        </form>
    </>
  );
};

export default PromptSelection;



