import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, TextField, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GET_CURRENT_ROUND, GetCurrentRoundData } from '../graphql/queries/roundQueries';
import { Round } from '../types';
import { NEW_GAG } from '../graphql/mutations/gagMutations';
import LoadingLogo from '../Components/LoadingLogo';
import useDirector from '../Hooks/useDirector';

const WritingRoom: React.FC = () => {
    const { gameId, playerId } = useParams();
    useDirector(gameId, playerId, "writing")
    const navigate = useNavigate();
    const [gag, setGag] = useState('');
    const [loading, setLoading] = useState(false);
    const [round, setRound] = useState<Round | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { loading: loadingRound, error: errorRound, data: roundData } = useQuery<GetCurrentRoundData>(GET_CURRENT_ROUND, {
        variables: { gameId},
        skip: !gameId,
        fetchPolicy: "network-only",
    });
    const [submitGag, { error: gagError}] = useMutation(NEW_GAG);

    useEffect (() => {
        if (gagError) {
          setErrorMessage(gagError.message)
        }
      }, [gagError])

    useEffect(() => {
        if (!gameId || !playerId) {
          setErrorMessage("Invalid Game ID or Player ID")
        } else if (errorRound) {
          setErrorMessage("Error fetching game data: " + errorRound.message)
        }
        if(roundData?.getCurrentRound) {
            setRound(roundData.getCurrentRound)
          if (roundData.getCurrentRound.stage === 1 && roundData.getCurrentRound.gags && roundData.getCurrentRound.gags.find(g => g.player._id === playerId)) {
            console.log("Player has already submitted a response to this round")
            navigate(`/submitted-room/${gameId}/${playerId}`)
          }
        }
    }, [roundData, gameId, playerId, navigate, errorRound])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const inputGag = event.target.value;
        setGag(inputGag.toUpperCase());
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
        if (!gag.trim()) {
            setErrorMessage("Response cannot be blank.")
            setLoading(false)
            return;
        }
        try {
            const {data: gagData} = await submitGag({variables: { roundId: round?._id, playerId: playerId, text: gag }})
            if (gagData?.createGag) {
                navigate(`/submitted-room/${gameId}/${playerId}`)
            }
        } catch (error: any) {
            console.error("Error submitting gag:", error)
            setErrorMessage(error.message || "Failed to submit response.");
        } finally {
            console.log(submitGag)
            setLoading(false)
        }
    };

    if (loadingRound) {
        return <LoadingLogo/>
    }

  return (
    <form onSubmit={handleSubmit}>
        <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
          {errorMessage && <Alert severity="error" sx={{ mb: 2}}> {errorMessage}</Alert>}
          <Box marginBottom="24px">
                <Typography variant="h4"> {round?.promptText}</Typography>
            </Box>
            <TextField 
                label="Response" 
                required
                value={gag} 
                onChange={handleChange} 
                variant="outlined"
                sx= {{
                    width: "260px",
                }}
            />
            <Box marginY="24px">
                <Button type="submit" color="secondary" disabled={loading} variant="contained">
                    {loading ? <CircularProgress size={24}/> : "SUBMIT"}
                </Button>
            </Box>
        </Box>
    </form>
  )
}
export default WritingRoom;