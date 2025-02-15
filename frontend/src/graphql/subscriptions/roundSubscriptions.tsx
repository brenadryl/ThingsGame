import { gql } from '@apollo/client';

export const NEW_ROUND_SUBSCRIPTION = gql`
  subscription OnNewRound($gameId: ID!) {
    newRound(gameId: $gameId) {
      _id
    }
  }
`;