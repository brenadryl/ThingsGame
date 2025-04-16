import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, TextField, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { NEW_GAG } from '../../graphql/mutations/gagMutations';
import { GameState, useGameStore } from '../../stores/useGameStore';
import { useParams } from 'react-router-dom';
import { GET_CURRENT_ROUND, GetCurrentRoundData } from '../../graphql/queries/roundQueries';
import LoadingLogo from '../LoadingLogo';
import { sortGags } from '../../utils/gameUtils';

const WritingRoom: React.FC = () => {
    const { gameId, playerId } = useParams();
    const [gag, setGag] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const round = useGameStore(state => state.currentRound)
    const setRound = useGameStore(state => state.setCurrentRound)
    const newGuess = useGameStore(state => state.newGuess)
    const setNewGuess = useGameStore(state => state.setNewGuess)
    const setGagList = useGameStore(state => state.setGagList)
    const setGuessList = useGameStore(state => state.setGuessList)
    const [submitGag, { error: gagError}] = useMutation(NEW_GAG);
    const setRoom = useGameStore((state: GameState) => state.setRoom)
    const { loading: loadingRound, error: errorRound, data: roundData } = useQuery<GetCurrentRoundData>(GET_CURRENT_ROUND, {
        variables: { gameId},
        skip: !gameId,
        fetchPolicy: "network-only",
    });

    if (newGuess?.gag.round._id !== round?._id) {
        setNewGuess(null)
    }

    useEffect(() => {
        if (!gameId || !playerId) {
          setErrorMessage("Invalid Game ID or Player ID")
        } else if (errorRound) {
          setErrorMessage("Error fetching game data: " + errorRound.message)
        }
        if(roundData?.getCurrentRound) {
            setRound(roundData.getCurrentRound)
            setGagList(sortGags(roundData.getCurrentRound.gags))
            setGuessList(roundData.getCurrentRound.guesses)
          if (roundData.getCurrentRound.stage === 1 && roundData.getCurrentRound.gags && roundData.getCurrentRound.gags.find(g => g.player._id === playerId)) {
            setRoom("submitted")
          }
        }
    }, [roundData, gameId, playerId, errorRound, setRoom, setRound, setGagList, setGuessList])

    useEffect (() => {
        if (gagError) {
          setErrorMessage(gagError.message)
        }
      }, [gagError])

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
                setRoom("submitted");
            }
        } catch (error: any) {
            console.error("Error submitting gag:", error)
            setErrorMessage(error.message || "Failed to submit response.");
        } finally {
            console.log(submitGag)
            setLoading(false)
        }
    };

    if (errorMessage) {
        return <Alert severity="error">{errorMessage}</Alert>
    }


    if (loadingRound) {
        return <LoadingLogo/>
    }

  return (
    <form onSubmit={handleSubmit}>
        <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
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