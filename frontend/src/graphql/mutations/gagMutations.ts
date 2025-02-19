import { gql } from "@apollo/client";

export const NEW_GAG = gql`
  mutation CreateGag($roundId: ID!, $playerId: ID!, $text: String!) {
    createGag(roundId: $roundId, playerId: $playerId, text: $text) {
      _id
      text
      player {
        _id
        icon
      }
      votes
      round {
        _id
      }
    }
  }
`;

export const UPDATE_GAG = gql`
  mutation UpdateGag($id: ID!, $votes: Int) {
    updateGag(id: $id, votes: $votes) {
      _id
      votes
    }
  }
`;