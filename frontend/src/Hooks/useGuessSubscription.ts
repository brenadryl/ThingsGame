import { useSubscription } from '@apollo/client';
import { Guess } from '../types';
import { getCurrentTurn } from '../utils/gameUtils';
import { NEW_GUESS_SUBSCRIPTION } from '../graphql/subscriptions/guessSubscription';
import { useGameStore } from '../stores/useGameStore';

export const useGuessSubscription = (
  playerId: string | undefined,
  setErrorMessage: (msg: string) => void
) => {
  const setGuessList  = useGameStore((state) => state.setGuessList);
  const setNewGuess = useGameStore((state) => state.setNewGuess);
  const currentRound = useGameStore((state) => state.currentRound);

  const roundId = currentRound?._id;

  useSubscription(NEW_GUESS_SUBSCRIPTION, {
    variables: { roundId },
    skip: !roundId,
    onSubscriptionData: ({ subscriptionData }) => {
      try {
        const updatedGuesses = subscriptionData.data?.newGuess;
        if (updatedGuesses) {
          setGuessList(updatedGuesses);
          setNewGuess(updatedGuesses[0]);
        }
      } catch (e: any) {
        console.error(e);
        setErrorMessage(e.message || "Error processing guess updates");
      }
    }
  });
};