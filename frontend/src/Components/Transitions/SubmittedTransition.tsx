import { Box, Typography} from '@mui/material';
import React from 'react';
import { GameState, useGameStore } from '../../stores/useGameStore';

 
const SubmittedTransition: React.FC = () => {
  const gagList = useGameStore((state: GameState) => state.gagList)
  const currentRound = useGameStore((state: GameState) => state.currentRound)
  
  return (
    <>
      <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
        <Typography>{currentRound?.promptText}</Typography>
        {gagList.map((currGag) => {
            return (
                <Box 
                    marginY={1} 
                    padding={1} 
                    bgcolor="secondary.main"
                    width="330px"
                    sx={{
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: "secondary.main"
                    }}
                >
                    <Typography> {currGag.text} </Typography>
                </Box>
            )
        })}
      </Box>
    </>
  )
}
export default SubmittedTransition;