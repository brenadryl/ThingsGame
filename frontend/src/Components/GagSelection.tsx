import React, { useState } from 'react';
import { Gag } from '../types';
import { Button, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface GagSelectionProps {
  gagList: Gag[];
  onClick: (gag: Gag) => void;
  myTurn: Boolean;
  setFavorite: (gagId: string) => void;
}

const GagSelection: React.FC<GagSelectionProps> = ({ gagList, onClick, myTurn, setFavorite}) => {
  const [selectedGag, setSelectedGag] = useState('');
  const [favoriteGag, setFavoriteGag] = useState('');
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
    <>
        {gagList.map((currGag) => {

            return (
                <Box width="100%" key={`${currGag._id}-container`}>
                    <IconButton key={`${currGag._id}-icon-button`} size="large" color={favoriteGag === currGag._id  ? "error" : undefined} onClick={() => selectFavorite(currGag)}>
                        {favoriteGag === currGag._id ? <FaHeart key={`${currGag._id}-heart`}  size={30}/> : <FaRegHeart key={`${currGag._id}-outline`} size={30}/>}
                    </IconButton>
                    <Button 
                        variant={selectedGag === currGag._id ? "contained" :"outlined"}
                        color="secondary"
                        key={currGag._id}
                        disabled={currGag.guessed}
                        sx={{
                            pointerEvents: myTurn ? "auto" : "none",
                            opacity: myTurn ? 1 : 1,
                            minWidth: '270px', 
                            marginBottom: '8px',
                            borderRadius: .5,
                            border: '2px solid'
                        }}
                        onClick={()=>{selectGag(currGag)}}
                    >
                        {currGag?.text || ''}
                    </Button>
                    
                </Box>
        )})}
    </>
  );
};

export default GagSelection;



