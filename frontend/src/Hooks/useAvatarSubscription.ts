import { useSubscription } from '@apollo/client';
import { GameState, useGameStore } from '../stores/useGameStore';
import { NEW_PLAYER_SUBSCRIPTION } from '../graphql/subscriptions/playerSubscriptions';

export const useAvatarSubscription = (
  gameId: string | undefined,
  setErrorMessage: (msg: string) => void
) => {
    const setPlayerList = useGameStore((state: GameState) => state.setPlayerList);
    useSubscription(NEW_PLAYER_SUBSCRIPTION, {
        variables: { gameId },
        skip: !gameId,
        onSubscriptionData: ({ subscriptionData }) => {
            try {
              if (subscriptionData?.data?.newPlayer) {
                const updatedPlayers = subscriptionData.data?.newPlayer;
                setPlayerList(updatedPlayers)
                console.log("avatar subscription", updatedPlayers)
              } else {
                console.warn("Subscription did not return expected data.");
              }
            } catch (err: any) {
              console.error("Error processing subscription data:", err);
              setErrorMessage(err.message || "Error processing player updates.");
            }
        },
    });
};