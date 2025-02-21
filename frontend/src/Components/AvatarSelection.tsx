import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useMutation } from '@apollo/client';
import { UPDATE_PLAYER_ICON } from '../graphql/mutations/playerMutations';
import { AVATAR_LIST, FUN_COLORS } from '../themes/constants';
import { Player } from '../types';

interface AvatarSelectionProps {
  playerId: string;
  gameId: string;
  currentAvatarIndex: number | null;
  playerList: Player[];
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ playerId, gameId, currentAvatarIndex, playerList }) => {
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number | null>(currentAvatarIndex);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [updateAvatar] = useMutation(UPDATE_PLAYER_ICON);

  useEffect(() => {
    if (currentAvatarIndex) {
      setSelectedAvatarIndex(currentAvatarIndex);
    }
  }, [currentAvatarIndex]);

  const handleSelectAvatar = async (avatarIndex: number) => {
    setSelectedAvatarIndex(avatarIndex);
    await updateAvatar({
        variables: { gameId, playerId, icon: avatarIndex },
      });
  };
  const handleColorClick = async (color: string) => {
    setSelectedColor(color);
    await updateAvatar({
        variables: { gameId, playerId, color: color },
      });
  };

  return (
    <Box display="flex" justifyContent="center" marginY="16px">
        <Box marginY='16px' sx={{ textAlign: 'center' }} maxWidth='300px'>
            <Typography variant="h3" color="text.secondary" gutterBottom>
                Color
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }} marginTop="16px">
                {FUN_COLORS.map((color) => (
                <Button
                    key={color}
                    onClick={() => handleColorClick(color)}
                    sx={{
                      backgroundColor: color,
                      width: 60,
                      height: 60,
                      minWidth: 60,
                      borderRadius: '30%',
                      border: selectedColor === color ? '2px solid' : 'none',
                      borderColor: "text.primary",
                    }}
                />
                ))}
            </Box>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center" marginY='16px'>
        <Typography variant="h3" color="text.secondary">Choose Your Avatar</Typography>
        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" marginTop="8px">
            {AVATAR_LIST.map((avatar: any, index: number) => {
                const open = !playerList.find((player) => player.icon === index);
                const me = playerList.find((player) => player._id === playerId)
                return (
            <Button
                  key={avatar.name}
                  onClick={() => handleSelectAvatar(index)}
                  disabled={!open}
                  sx={{
                  width: 80,
                  height: 80,
                  opacity: !open && me?.icon !== index ? 0.1 : 1,
                  bgcolor: me?.icon === index ? me?.color || selectedColor : (!open ? 'grey' : "none"),
                  border: selectedAvatarIndex === index ? '2px solid' : 'none',
                  borderColor: "text.primary",
                }}
            >
                <img src={me?.icon === index ? avatar.happy : avatar.neutral} key={`${avatar.name}-img`} alt={avatar.name} width="100%" />
            </Button>
            )})}
        </Box>
        </Box>
    </Box>
  );
};

export default AvatarSelection;