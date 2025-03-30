import { useSubscription } from '@apollo/client';
import { useGameStore } from '../stores/useGameStore';
import { NEW_ROUND_SUBSCRIPTION } from '../graphql/subscriptions/roundSubscriptions';

export const useRoundSubscription = (
  setErrorMessage: (msg: string) => void,
  playerId: string
) => {
    const game = useGameStore((state) => state.game)
    const players = useGameStore((state) => state.playerList)
    const setRoom = useGameStore((state) => state.setRoom)
    const setGuessList = useGameStore((state) => state.setGuessList)
    const setGagList = useGameStore((state) => state.setGagList)
    const setCurrentRound = useGameStore((state) => state.setCurrentRound)
    const setCurrentTurnPlayer = useGameStore((state) => state.setCurrentTurnPlayer)
    const setMyTurn = useGameStore((state) => state.setMyTurn)
    const gameId = game?._id;

    useSubscription(NEW_ROUND_SUBSCRIPTION, {
        variables: {gameId},
        onSubscriptionData: ({subscriptionData}) => {
            try {
                const round = subscriptionData?.data?.newRound;
                if (round?._id) {
                    setGuessList([]);
                    setGagList([]);
                    setCurrentRound(round);
                    const currTurnPlayer = players[round.turn] || null;
                    setCurrentTurnPlayer(currTurnPlayer)
                    setMyTurn(currTurnPlayer?._id === playerId)
                    console.log("Round started! Navigating to Writing Room...")
                    setRoom("writing")
                }
            } catch (e: any) {
                console.error(e);
                setErrorMessage(e.message || "Error getting round data");
            }
          }
      })
};