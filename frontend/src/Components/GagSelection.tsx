import React, { useState } from 'react';
import { Gag } from '../types';
import { Button, IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { AVATAR_LIST } from '../themes/constants';

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
        {gagList.map((currGag) => {
          console.log("currGag", currGag)

            return (
                <Box width="100%" key={`${currGag._id}-container`} display="flex" alignItems="center" position="relative">
                    <IconButton key={`${currGag._id}-icon-button`} size="large" color={favoriteGag === currGag._id  ? "error" : undefined} onClick={() => selectFavorite(currGag)}>
                        {favoriteGag === currGag._id ? <FaHeart key={`${currGag._id}-heart`}  size={30}/> : <FaRegHeart key={`${currGag._id}-outline`} size={30}/>}
                    </IconButton>
                    <Box position="relative">
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
                      {currGag.guessed && currGag.player.icon !== undefined && (
                        <img 
                          src={AVATAR_LIST[currGag.player.icon].sad} 
                          key={`${currGag.player._id}-img`} 
                          alt={currGag.player._id} 
                          style={{
                            position: 'absolute',
                            top: '45%', 
                            left: '90%', 
                            transform: 'translate(-50%, -50%)', // Centers it over the button
                            maxWidth: '50px', // Adjust size as needed
                            maxHeight: '50px',
                            width: 'auto',
                            height: 'auto',
                            pointerEvents: 'none', // Prevents it from interfering with button clicks
                          }} 
                        />
                      )}
                    </Box>
                    
                </Box>
        )})}
    </Box>
  );
};

export default GagSelection;



