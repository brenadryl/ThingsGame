import { useSubscription } from '@apollo/client';
import { NEW_LIKE_SUBSCRIPTION } from '../graphql/subscriptions/likeSubscriptions';
import { GameState, useGameStore } from '../stores/useGameStore';

export const useLikeSubscription = (
  setErrorMessage: (msg: string) => void
) => {
  const setLikes = useGameStore((state: GameState) => state.setLikes);
  const currentRound = useGameStore((state: GameState) => state.currentRound)

  const roundId = currentRound?._id;

  useSubscription(NEW_LIKE_SUBSCRIPTION, {
    variables: { roundId },
    skip: !roundId,
    onSubscriptionData: ({ subscriptionData }) => {
      try {
        const updateLikes = subscriptionData.data?.newLike;
        if (updateLikes) {
          setLikes(updateLikes);
        }
      } catch (e: any) {
        console.error(e);
        setErrorMessage(e.message || "Error processing like updates");
      }
    }
  });
};