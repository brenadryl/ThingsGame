import { gql } from "@apollo/client";
import { Round } from "../../types";

export const GET_CURRENT_ROUND = gql`
  query GetCurrentRound($id: ID!, $gameId: ID!) {
    getCurrentRound(id: $id, gameId: $gameId) {
        _id
        promptText
        stage
        turn
        gags {
            text
            player {
                _id
            }
        }
    }
  }
`;

export interface GetCurrentRoundData {
    getCurrentRound: Round;
}