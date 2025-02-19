import React from 'react';
import { Gag, Player } from '../types';
import { Button } from '@mui/material';

interface PlayerSelectionProps {
  playerList: Player[];
  gagList: Gag[];
  onClick: (player: Player) => void;
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({ playerList, gagList, onClick }) => {
    const clickable = playerList.length === gagList.length;
    console.log(clickable)
    return ( 
    <>
        {playerList.map((currPlayer) => {
            const gag = gagList.find((gag) => gag.player._id === currPlayer._id) || undefined;

            return (
            <Button 
                variant="contained"
                key={currPlayer._id}
                disabled={!gag || gag.guessed}
                sx={{ 
                    pointerEvents: clickable ? "auto" : "none",
                    opacity: clickable ? 1 : 1,
                    minWidth: '200px', 
                    backgroundColor: currPlayer.color || '', 
                    borderRadius: .5,
                }}
                onClick={()=>{onClick(currPlayer)}}
            >
                {currPlayer?.name || ''}
            </Button>
        )})}
    </>
  );
};

export default PlayerSelection;



