import { useSubscription } from '@apollo/client';
import { Gag } from '../types';
import { GAG_UPDATE_SUBSCRIPTION } from '../graphql/subscriptions/gagSubscriptions';
import { useGameStore } from '../stores/useGameStore';
import { sortGags } from '../utils/gameUtils';

export const useGagSubscription = (
  setErrorMessage: (msg: string) => void
) => {
    const setGagList = useGameStore((state) => state.setGagList);
    const currentRound = useGameStore((state) => state.currentRound);


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