import { gql } from '@apollo/client';

export const NEW_LIKE_SUBSCRIPTION = gql`
  subscription newLike($roundId: ID!) {
    newLike(roundId: $roundId) {
      _id
      player {
        _id
      }
      gag {
        _id
      }
    }
  }
`;