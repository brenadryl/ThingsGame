import { Button, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { GameState, useGameStore } from "../stores/useGameStore";
import { Gag, Guess } from "../types";
import { useEffect, useState } from "react";
import { AVATAR_LIST } from "../themes/constants";
import GuessDisplay from "./GuessedDisplay";

interface GagButtonProps {
  selectGag: (gag: Gag) => void;
  currGag: Gag;
  isStandardMode?: Boolean;
  selectedGag: string;
  isSpectator?: Boolean;
}

const GagButton: React.FC<GagButtonProps> = ({ selectGag, currGag, isStandardMode, selectedGag, isSpectator}) => {
    const myTurn = useGameStore((state: GameState) => state.myTurn)
    const newGuess = useGameStore((state: GameState) => state.newGuess)
    const guessList = useGameStore((state: GameState) => state.guessList)
    const [gagGuesses, setGagGuesses] = useState<Guess[]>([]);
    const [isCorrectGuessVisible, setIsCorrectGuessVisible] = useState(false);
    const playerList = useGameStore((state: GameState) => state.playerList)
    const player = playerList.find(p => p._id === currGag.player._id)

    useEffect(() => {
        if (newGuess === null) {
            const individualGuesses = guessList?.filter((guess) => guess.gag._id === currGag._id && !guess.isCorrect).reduce((acc: Guess[], curr: Guess) => {
                if (!acc.find(g => g.guessed._id === curr.guessed._id)) {
                    acc.push(curr);
                }
                return acc;
            }, []) || [];
            setGagGuesses(individualGuesses);
        }
        const currGagGuess = guessList.find((guess) => (guess.gag._id === currGag._id) && guess.isCorrect)
        setIsCorrectGuessVisible(
          currGag.guessed &&
          (newGuess?.gag._id || '') !== currGag._id &&
          !!currGagGuess &&
          (Date.now() - ((currGagGuess?.createdAt || 1) * 1000) > 2000)
        );
    }, [guessList, currGag, newGuess])


    return (
        <Box>
          <Box position="relative" paddingTop="4px" paddingBottom={gagGuesses.length > 0 ? "0px" : "4px"} marginBottom={gagGuesses.length > 0 ? "-4px" : "0px"}>
            <Button 
                variant={myTurn || isSpectator ? "contained" :"outlined"}
                color={selectedGag === currGag._id ? "info" : "secondary"}
                key={currGag._id}
                disabled={isCorrectGuessVisible || (!myTurn && !isSpectator)}
                sx={{
                    pointerEvents: myTurn ? "auto" : "none",
                    opacity: myTurn ? 1 : 1,
                    width: '270px', 
                    marginBottom: '8px',
                    borderRadius: .5,
                    textDecoration: isCorrectGuessVisible ? "line-through" : undefined,
                    textDecorationThickness: '3px',
                }}
                onClick={()=>{
                    if (isSpectator) return null;
                    selectGag(currGag)
                }}
            >
                {currGag?.text || ''}
            </Button>
            {isCorrectGuessVisible && player?.icon !== undefined && (
              <img 
                src={AVATAR_LIST[player?.icon]?.sad ?? "image"} 
                key={`${player._id}-img`} 
                alt={player._id} 
                style={{
                  position: 'absolute',
                  top: '45%', 
                  left: '90%', 
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '50px',
                  maxHeight: '50px',
                  width: 'auto',
                  height: 'auto',
                  pointerEvents: 'none',
                }} 
              />
            )}
          </Box>
          <GuessDisplay gagGuesses={gagGuesses} isStandardMode={isStandardMode} />
        </Box>
    )
}

export default GagButton;