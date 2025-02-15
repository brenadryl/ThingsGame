import { gql } from "@apollo/client";

export const NEW_GUESS = gql`
  mutation CreateGuess($gagId: ID!, $guesserId: ID!, $guessedId: ID!) {
    createGuess(gagId: $gagId, guesserId: $guesserId, guessedId: $guessedId) {
      _id
      isCorrect
    }
  }
`;