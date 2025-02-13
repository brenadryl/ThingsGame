import { gql } from "@apollo/client";

export const NEW_GAG = gql`
  mutation CreateGag($roundId: ID!, $playerId: ID!, $text: String!) {
    createGag(roundId: $roundId, playerId: $playerId, text: $text) {
      _id
      text
      player {
        _id
      }
      votes
      round {
        _id
      }
    }
  }
`;