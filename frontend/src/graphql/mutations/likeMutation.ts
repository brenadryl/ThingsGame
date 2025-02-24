// createLike: async (_, {playerId, roundId, gagId}) => {
import { gql } from "@apollo/client";

export const NEW_LIKE = gql`
  mutation CreateLike($playerId: ID!, $roundId: ID!, $gagId: ID!) {
    createLike(playerId: $playerId, roundId: $roundId, gagId: $gagId) {
      _id
      gag {
        _id
      }
      player {
        _id
      }
    }
  }
`;