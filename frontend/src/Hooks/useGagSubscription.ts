import { useSubscription } from '@apollo/client';
import { GAG_UPDATE_SUBSCRIPTION } from '../graphql/subscriptions/gagSubscriptions';
import { GameState, useGameStore } from '../stores/useGameStore';
import { sortGags } from '../utils/gameUtils';

export const useGagSubscription = (
  setErrorMessage: (msg: string) => void
) => {
    const setGagList = useGameStore((state: GameState) => state.setGagList);
    const currentRound = useGameStore((state: GameState) => state.currentRound);


    const roundId = currentRound?._id;

    useSubscription(GAG_UPDATE_SUBSCRIPTION, {
        variables: { roundId },
        skip: !roundId,
        onSubscriptionData: ({ subscriptionData }) => {
        try {
            const updatedGags = subscriptionData.data?.gagUpdate;
            console.log("updatedGags", updatedGags)
            if (updatedGags) {
                setGagList(sortGags(updatedGags));
            }
        } catch (e: any) {
            console.error(e);
            setErrorMessage(e.message || "Error processing gag updates");
        }
        }
    });
};