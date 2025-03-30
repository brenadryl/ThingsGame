import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_GAME, GetGameData } from '../graphql/queries/gameQueries';
import { Guess } from '../types';
import { useGameStore } from '../stores/useGameStore';
import { getCurrentTurn, shallowEqual, sortGags } from '../utils/gameUtils';

export const useGameQuery = (
  gameId: string | undefined,
  playerId: string | undefined,
  currentRoundId?: string,
) => {
    const navigate = useNavigate();
    const setGame = useGameStore((state) => state.setGame);
    const setGagList = useGameStore((state) => state.setGagList);
    const setLikes = useGameStore((state) => state.setLikes);
    const setGuessList = useGameStore((state) => state.setGuessList);
    const setCurrentTurnPlayer = useGameStore((state) => state.setCurrentTurnPlayer);
    const setMyTurn = useGameStore((state) => state.setMyTurn);
    const setPlayerList = useGameStore((state) => state.setPlayerList);
    const setCurrentRound = useGameStore((state) => state.setCurrentRound);

    const gagList = useGameStore((state) => state.gagList);
    const playerList = useGameStore((state) => state.playerList);
    const likeList = useGameStore((state) => state.likes);
    const guessList = useGameStore((state) => state.guessList);
    const currentTurnPlayer = useGameStore((state) => state.currentTurnPlayer);
    const myTurn = useGameStore((state) => state.myTurn);

    const { loading: loadingGame, error: errorGame } = useQuery<GetGameData>(GET_GAME, {
        variables: { id: gameId, roundId: currentRoundId },
        skip: !gameId,
        onCompleted(data) {
            console.log("gettingGame. data : ", data);
            if (!!data?.getGame) {
                const game = data.getGame;
                console.log("got Game. game : ", game.gameCode);
                setGame(game);
        
                if (!!game.currentRound) {
                    const gags = game.currentRound.gags || [];
                    const likes = game.currentRound.likes || [];
                    const guesses = game.currentRound.guesses || [];
                    setCurrentRound(game.currentRound)
                    
        
                    if (gags.length >= gagList.length && !shallowEqual(gags, gagList)) {
                        setGagList(sortGags(gags));
                    }
                    if (likes.length >= likeList.length && !shallowEqual(likes, likeList)) {
                        setLikes(likes);
                    }
                    if (guesses.length >= guessList.length && !shallowEqual(guesses, guessList)) {
                        console.log("resetting guesses")
                        setGuessList(guesses)
                    }
                    
                    const lastWrongGuess = guesses.filter((guess: Guess) => !guess.isCorrect)[0];
                    const currPlayerTurn = getCurrentTurn(game.players, lastWrongGuess, game.currentRound.turn || 0, gags);
                    if (!!currPlayerTurn?._id && currPlayerTurn?._id !== currentTurnPlayer?._id) setCurrentTurnPlayer(currPlayerTurn);
                    
                    const myTurnStatus = currPlayerTurn?._id === playerId;
                    if (myTurnStatus !== myTurn) setMyTurn(currPlayerTurn?._id === playerId);
                } 
                if (!!game.players) {
                    const players = game.players || [];
                    if (players.length >= playerList.length && !shallowEqual(players, playerList)) {
                        setPlayerList(players)
                    }
                }
            }
        },
    });

    useEffect(() => {
        console.log("loadingGame: ", loadingGame);
        console.log("errorGame: ", errorGame);
        if (!loadingGame && errorGame) {
            setTimeout(() => navigate('/'), 3000);
        }
    }, [ errorGame, loadingGame, navigate ]);
};