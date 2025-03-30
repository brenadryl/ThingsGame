import { Typography } from "@mui/material"
import { Box } from "@mui/system"
import { Guess } from "../types";
import { AVATAR_LIST } from "../themes/constants";

interface GuessDisplayProps {
  gagGuesses: Guess[];
  isStandardMode?: Boolean;
}

const GuessDisplay: React.FC<GuessDisplayProps> = ({ gagGuesses, isStandardMode}) => {

    if (gagGuesses.length === 0 || isStandardMode) return <></>;

    return (
        <Box display="flex" alignContent="left" marginBottom="4px">
            <Typography color="grey" variant="body2">GUESSED: </Typography>
            {gagGuesses.map((currGuess) => (
                currGuess?.guessed?.icon !== undefined && <img src={AVATAR_LIST[currGuess.guessed.icon]["suspicious"]} key={`${currGuess.guessed.name}-img`} alt={currGuess.guessed.name} style={{ maxWidth: 30, maxHeight: 30, width: 'auto', height: 'auto', marginLeft: "8px" }} />
            ))}
        </Box>
    )
}

export default GuessDisplay;