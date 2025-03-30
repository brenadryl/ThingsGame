import { Button, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useGameStore } from "../stores/useGameStore";
import { Gag, Guess } from "../types";
import { useEffect, useState } from "react";
import { AVATAR_LIST } from "../themes/constants";
import GuessDisplay from "./GuessedDisplay";

interface GagButtonProps {
  selectGag: (gag: Gag) => void;
  currGag: Gag;
  isStandardMode?: Boolean;
  selectedGag: string;
}

const GagButton: React.FC<GagButtonProps> = ({ selectGag, currGag, isStandardMode, selectedGag}) => {
    const myTurn = useGameStore((state) => state.myTurn)
    const guessList = useGameStore((state) => state.guessList)
    const [gagGuesses, setGagGuesses] = useState<Guess[]>([]);
    const playerList = useGameStore((state) => state.playerList)
    const player = playerList.find(p => p._id === currGag.player._id)

    useEffect(() => {
        console.log("GUESS LIST USE EFFECT:", guessList)
        const individualGuesses = guessList?.filter((guess) => guess.gag._id === currGag._id && !guess.isCorrect).reduce((acc: Guess[], curr: Guess) => {
            if (!acc.find(g => g.guessed._id === curr.guessed._id)) {
                acc.push(curr);
            }
            return acc;
        }, []) || [];
        setGagGuesses(individualGuesses);
    }, [guessList, currGag])

    console.log("gagGuesses", gagGuesses);

    return (
        <Box>
          <Box position="relative" paddingTop="4px" paddingBottom={gagGuesses.length > 0 ? "0px" : "4px"} marginBottom={gagGuesses.length > 0 ? "-4px" : "0px"}>
            <Button 
                variant={selectedGag === currGag._id ? "contained" :"outlined"}
                color="secondary"
                key={currGag._id}
                disabled={currGag.guessed || !myTurn}
                sx={{
                    pointerEvents: myTurn ? "auto" : "none",
                    opacity: myTurn ? 1 : 1,
                    width: '270px', 
                    marginBottom: '8px',
                    borderRadius: .5,
                    border: '2px solid',
                    textDecoration: currGag.guessed ? "line-through" : undefined,
                    textDecorationThickness: '3px',
                }}
                onClick={()=>{selectGag(currGag)}}
            >
                {currGag?.text || ''}
            </Button>
            {currGag.guessed && player?.icon !== undefined && (
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