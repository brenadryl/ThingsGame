import { useSubscription } from '@apollo/client';
import { NEW_GUESS_SUBSCRIPTION } from '../graphql/subscriptions/guessSubscription';
import { GameState, useGameStore } from '../stores/useGameStore';

export const useGuessSubscription = (
  playerId: string | undefined,
  setErrorMessage: (msg: string) => void
) => {
  const setGuessList  = useGameStore((state: GameState) => state.setGuessList);
  const setNewGuess = useGameStore((state: GameState) => state.setNewGuess);
  const currentRound = useGameStore((state: GameState) => state.currentRound);

  const roundId = currentRound?._id;

  useSubscription(NEW_GUESS_SUBSCRIPTION, {
    variables: { roundId },
    skip: !roundId,
    onSubscriptionData: ({ subscriptionData }) => {
      try {
        const updatedGuesses = subscriptionData.data?.newGuess;
        setNewGuess(updatedGuesses[0] || null);
        if (updatedGuesses) {
          setGuessList(updatedGuesses);
        }
      } catch (e: any) {
        console.error(e);
        setErrorMessage(e.message || "Error processing guess updates");
      }
    }
  });
};