import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Typography} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Emotion, Player, SUPERLATIVE_DESCRIPTIONS, SuperlativeKey } from '../../types';
import { CHANGE_GAME_MUTATION } from '../../graphql/mutations/gameMutations';
import PlayerCard from '../PlayerCards';
import SuperlativeCard from '../Superlatives';
import { useGameStore } from '../../stores/useGameStore';
import { calculatePoints, getFavoriteGags, getSuperlatives } from '../../utils/gameUtils';
import LoadingLogo from '../LoadingLogo';
import { GET_PLAYERS, GetPlayersData } from '../../graphql/queries/playerQueries';
import { useGameQuery } from '../../Hooks/useGameQuery';
import { GiQueenCrown } from 'react-icons/gi';

const ScoreRoom: React.FC = () => {  
  const { gameId, playerId } = useParams();
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const game = useGameStore((state) => state.game)
  const currentRound = useGameStore((state) => state.currentRound)
  const [updateGame, {loading: updateGameLoading, error: updateGameError}] = useMutation(CHANGE_GAME_MUTATION);
  const {totalLikeCounts, favoriteGags} = getFavoriteGags(game)
  useGameQuery(gameId, playerId, currentRound?._id)

  const { loading: loadingPlayers, error: errorPlayers } = useQuery<GetPlayersData>(GET_PLAYERS, {
    variables: { gameId, roundId: currentRound?._id },
    skip: !gameId,
    fetchPolicy: 'network-only',
    onCompleted(data) {
      if (!!data?.getPlayers) {
        setPlayerList(data.getPlayers);
      }
    },
  });


  const pointArray = useMemo(() => calculatePoints(game, favoriteGags || [], playerList), [game, favoriteGags, playerList]);
  const superlatives = useMemo(() => getSuperlatives(playerList), [playerList]);

  if (errorMessage || errorPlayers) {
    return <Alert severity="error">{errorMessage}</Alert>
  }
  if (!game || loadingPlayers) return <LoadingLogo />;

  const handleUpdateGame = async () => {
    if (!gameId) return;
    try {
      await updateGame({variables: { id: gameId, active: true, stage: 2 }})
      console.log("Next Round!")
    } catch (error) {
      console.error("Error starting next round:", error)
      setErrorMessage("Failed to start next round.");
    }
  }

  const renderPlayerCards = () => (
    pointArray.map((scoreEntry, index) => {
      const currPlayer = game?.players.find(p => p._id === scoreEntry.playerId);
      const points = scoreEntry.points;
      const n = pointArray.length
      let emotion = "nervous"
      if (index === 0) {
        emotion = "happy";
      } else if (index === n - 1) {
        emotion = "sad";
      } else if (index <= Math.floor((n - 1) / 2)) {
        emotion = "neutral";
      }
      return (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <PlayerCard 
            key={currPlayer?._id} 
            name={currPlayer?.name || ''}
            color={currPlayer?.color || ''}
            points={points}
            icon={currPlayer?.icon}
            emotion={emotion as Emotion}
          />
          { index === 0 && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '-20px', 
                right: '0px', 
                transform: 'rotate(20deg)' 
              }}
            >
              <GiQueenCrown color="gold" size={40} />
            </Box>
          )}
        </Box>
      );
    })
  );

  return (
    <Box textAlign="center" alignItems="center"  marginTop="32px" display="flex" flexDirection="column">
      <Box textAlign="center" alignItems="center"  marginBottom="32px" display="flex" flexDirection="row">
        <Typography color="text.secondary" variant="h3">SCOREBOARD</Typography>
      </Box>
      <Box display="flex" justifyContent="center" flexWrap="wrap">
        {renderPlayerCards()}
      </Box>
        {(favoriteGags?.length || 0) > 0 && (
            <Box marginTop="24px">
                <Typography color="text.secondary" variant='h4'>FAVORITE RESPONSES: </Typography>
            </Box>
        )}
        {favoriteGags?.map((gag) => {
            if (gag) {
                return (
                    <Box 
                        display="flex" 
                        key={`${gag?._id}-container`} 
                        marginY="8px"
                        justifyContent="space-between"
                        width="320px"
                        alignItems="center"
                        padding="8px" 
                        sx={{
                            border: 1,
                            borderColor: "secondary.main",
                            borderRadius: 1,
                        }}
                    >
                        <Typography color="secondary" textAlign="left"> {gag.text}</Typography>
                        <Box marginLeft="16px">
                            <Typography color="secondary" key={`${gag?._id}-votes`}>{totalLikeCounts[gag?._id]}</Typography>
                        </Box>
                    </Box>
                )
            } else {
                return null;
            }
        })}


      {game && game.players.length > 0 && game.players?.[0]?._id === playerId && game.active && (
        <Button onClick={handleUpdateGame} variant='contained' disabled={updateGameLoading} sx={{marginTop: '24px'}}>
          {updateGameLoading ? <CircularProgress size={24}/> : "START NEXT ROUND"}
        </Button>
      )}
        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center" paddingY="16px">
            {Object.entries(superlatives).map(([key, playerId]) => {
                const player = game?.players.find(p => p._id === playerId);
                const details = SUPERLATIVE_DESCRIPTIONS[key as SuperlativeKey];
    
                if (!player || !details) return null;
    
                return (
                    <SuperlativeCard key={key} player={player} superlative={details.title} description={details.description} emotion={details.emotion as Emotion} />
                );
            })}
        </Box>
      {updateGameError && <Alert severity="error">Error starting game: {updateGameError.message}</Alert>}
    </Box>
  )
}
export default ScoreRoom;