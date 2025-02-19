import React from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCards';
import { Box } from '@mui/system';

interface PlayerListProps {
  playerList: Player[];
}

const PlayerList: React.FC<PlayerListProps> = ({ playerList }) => {
  return ( 
    <Box display="flex" justifyContent="center" flexWrap="wrap">
        {playerList.map((currPlayer) => (
            <PlayerCard key={currPlayer._id} name={currPlayer?.name || ''} color={currPlayer.color || ''} icon={currPlayer.icon}/>
        ))}
    </Box>
  );
};

export default PlayerList;



