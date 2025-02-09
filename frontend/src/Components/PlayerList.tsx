import React from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCards';
import { FUN_ICONS } from '../themes/constants';

interface PlayerListProps {
  playerList: Player[];
}

const PlayerList: React.FC<PlayerListProps> = ({ playerList }) => {
  return ( 
    <>
        {playerList.map((currPlayer) => (
            <PlayerCard key={currPlayer._id} name={currPlayer?.name || ''} icon={FUN_ICONS[currPlayer.icon || 0]} color={currPlayer.color || ''}/>
        ))}
    </>
  );
};

export default PlayerList;



