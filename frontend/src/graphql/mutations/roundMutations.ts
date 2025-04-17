import { gql } from "@apollo/client";

export const NEW_ROUND = gql`
  mutation CreateRound($gameId: ID!, $promptText: String!, $turn: Int!) {
    createRound(gameId: $gameId, promptText: $promptText, turn: $turn) {
      _id
      promptText
      stage
      createdAt
      game {
        _id
      }
    }
  }
`;