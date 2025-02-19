import React from 'react';
import { Gag, Player } from '../types';
import { Button } from '@mui/material';
import PlayerCard from './PlayerCards';
import { Box } from '@mui/system';

interface PlayerSelectionProps {
  playerList: Player[];
  gagList: Gag[];
  onClick: (player: Player) => void;
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({ playerList, gagList, onClick }) => {
    const clickable = playerList.length === gagList.length;
    console.log(clickable)
    return ( 
        <Box display="flex" justifyContent="center" flexWrap="wrap">
            {playerList.map((currPlayer) => {
                const gag = gagList.find((gag) => gag.player._id === currPlayer._id) || undefined;
                return (
                <Button 
                    key={currPlayer._id}
                    disabled={!gag || gag.guessed}
                    sx={{ 
                        pointerEvents: !gag || gag.guessed ? "none" : "auto",
                        padding: 0,
                        opacity: !gag || gag.guessed ? 0.3 : 1,
                        borderRadius: .5,
                        width: '130px'
                    }}
                    onClick={()=>{onClick(currPlayer)}}
                >
                    <PlayerCard key={currPlayer._id} name={currPlayer?.name || ''} color={currPlayer.color || ''} icon={currPlayer.icon}/>
                </Button>
            )})}
        </Box>
  );
};

export default PlayerSelection;



