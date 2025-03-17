import { useQuery } from '@apollo/client';
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { Page } from '../types';

const useDirector = (gameId: String | undefined, playerId: String | undefined, room: Page) => {
    const navigate = useNavigate();

    const { loading: loadingGame, error: errorGame, data: gameData } = useQuery<GetGameData>(GET_GAME, {
        variables: {id: gameId},
        skip: !gameId,
        fetchPolicy: "network-only",
    });

    useEffect(() => {
        if (!loadingGame && gameData?.getGame) {
            const game = gameData.getGame;
            if (!game.currentRound) {
                if (game.stage === 1 && room !== "waiting") {
                    navigate(`/waiting-room/${gameId}/${playerId}`);
                } else if (game.stage === 2 && room !== "play") {
                    navigate(`/play-room/${gameId}/${playerId}`)
                }
            } else {
                const currentRound = game.currentRound;
                const gagSubmitted = currentRound.gags.find(g => g.player._id === playerId);
                const allPlayersIn = game.players.length === currentRound.gags.length;
                if (game.stage === 2 && currentRound.stage === 1 && room !== "writing" && !gagSubmitted) {
                    navigate(`/writing-room/${gameId}/${playerId}`)
                } else if (currentRound.stage === 1 && room !== "submitted" && gagSubmitted && !allPlayersIn) {
                    navigate(`/submitted-room/${gameId}/${playerId}`)
                } else if (currentRound.stage === 1 && room !== "guessing" && gagSubmitted && allPlayersIn) {
                    navigate(`/guessing-room/${gameId}/${playerId}`)
                } else if (game.stage === 3 && room !== "score") {
                    navigate(`/score-room/${gameId}/${playerId}`)
                } else if (game.stage === 2 && room !== "play" && currentRound.stage === 2) {
                    navigate(`/play-room/${gameId}/${playerId}`)
                }
            }
        }
        if (!loadingGame && errorGame) {
            setTimeout(() => navigate('/'), 5000);
        }

    }, [gameData, gameId, navigate, playerId, room, errorGame, loadingGame])
}

export default useDirector;