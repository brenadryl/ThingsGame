import { gql } from '@apollo/client';

export const NEW_GUESS_SUBSCRIPTION = gql`
  subscription OnNewGuess($roundId: ID!) {
    newGuess(roundId: $roundId) {
        _id
        isCorrect
        gag {
            _id
            text
        }
        guessed {
            _id
        }
        guesser {
            _id
        }
    }
}
`;