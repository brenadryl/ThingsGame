import { useSubscription } from '@apollo/client';
import { GameState, useGameStore } from '../stores/useGameStore';
import { AVATAR_SELECTION_SUBSCRIPTION } from '../graphql/subscriptions/playerSubscriptions';

export const usePlayerSubscription = (
  gameId: string | undefined,
  setErrorMessage: (msg: string) => void
) => {
    const setPlayerList = useGameStore((state: GameState) => state.setPlayerList);
    useSubscription(AVATAR_SELECTION_SUBSCRIPTION, {
        variables: { gameId },
        skip: !gameId,
        onSubscriptionData: ({ subscriptionData }) => {
            try {
              if (subscriptionData?.data?.avatarSelected) {
                const updatedPlayers = subscriptionData.data.avatarSelected;
                setPlayerList(updatedPlayers);
                console.log("player subscription: ", updatedPlayers)
              } else {
                console.warn("Subscription did not return expected data.");
              }
            } catch (err: any) {
              console.error("Error processing subscription data:", err);
              setErrorMessage(err.message || "Error processing avatar updates.");
            }
        },
    });
};