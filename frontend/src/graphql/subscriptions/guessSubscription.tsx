import { gql } from '@apollo/client';

export const NEW_GUESS_SUBSCRIPTION = gql`
  subscription OnNewGuess($roundId: ID!) {
    newGuess(roundId: $roundId) {
        _id
        isCorrect
        createdAt
        gag {
            _id
            text
        }
        guessed {
            _id
            icon
            name
            color
        }
        guesser {
            _id
            icon
            name
            color
        }
    }
}
`;