import React, { useEffect, useState } from 'react';
import { Gag } from '../types';
import { IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useGameStore } from '../stores/useGameStore';
import GagButton from './GagButton';

interface GagSelectionProps {
  onClick: (gag: Gag) => void;
  playerId: string;
  setFavorite: (gagId: string) => void;
  isStandardMode?: Boolean;
}

const GagSelection: React.FC<GagSelectionProps> = ({ onClick, playerId, setFavorite, isStandardMode}) => {
  const gags = useGameStore((state) => state.gagList)
  const likes = useGameStore((state) => state.likes)
  const myTurn = useGameStore((state) => state.myTurn)

  const [selectedGag, setSelectedGag] = useState('');
  const [favoriteGag, setFavoriteGag] = useState("");

  useEffect(() => {
    const fav = likes.find(l => l.player._id === playerId)?.gag?._id || "";
    setFavoriteGag(fav)
  }, [likes, playerId])

  if (!myTurn && selectedGag !== '') {
      setSelectedGag('')
  }
  const selectGag = (gag: Gag) => {
    if (myTurn) {
        setSelectedGag(gag._id)
        onClick(gag)
    }
  }
  const selectFavorite = (gag: Gag) => {
    setFavoriteGag(gag._id)
    setFavorite(gag._id)
  }

    return ( 
      <Box 
        display="flex" 
        justifyContent="center" 
        flexDirection="column" 
        paddingX="16px"
        paddingTop="32px"
        paddingBottom="16px"
        margin="-20px"
        sx={{
          borderRadius: "16px",
          border: '2px solid',
          borderColor: myTurn ? "warning.main" : "secondary.light"
        }}
      >
        {myTurn && <Typography variant="body2" color="warning.main" sx={{paddingBottom: "16px", marginTop: "-16px", zIndex: 1}}>SELECT A RESPONSE TO GUESS</Typography>}
        {gags.map((currGag) => {
          const gagLikes = likes.filter((l) => l.gag._id === currGag._id).length || 0;
          const favId = favoriteGag;

            return (
                <Box width="100%" key={`${currGag._id}-container`} display="flex" alignItems="center" position="relative">
                  <Box display="flex" flexDirection="column" key={`${currGag._id}-like-container`} >
                    <IconButton sx={{ paddingTop: "0px"}} key={`${currGag._id}-icon-button`} size="large" color={favId === currGag._id  ? "error" : undefined} onClick={() => selectFavorite(currGag)}>
                        {favId === currGag._id ? <FaHeart key={`${currGag._id}-heart`}  size={25}/> : <FaRegHeart key={`${currGag._id}-outline`} size={25}/>}
                    </IconButton>
                    {gagLikes !== 0 && <Typography variant='body2' color="grey" key={`${currGag._id}-like-cound`} marginTop="-14px"> {gagLikes}</Typography>}
                  </Box>
                  <GagButton selectGag={selectGag} currGag={currGag} isStandardMode={isStandardMode} selectedGag={selectedGag} />
                </Box>
        )})}
    </Box>
  );
};

export default GagSelection;



