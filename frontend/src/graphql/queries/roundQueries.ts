import { gql } from "@apollo/client";
import { Round } from "../../types";

export const GET_CURRENT_ROUND = gql`
  query GetCurrentRound( $gameId: ID!) {
    getCurrentRound(gameId: $gameId) {
        _id
        promptText
        stage
        turn
        guesses {
          _id
          createdAt
          isCorrect
          guesser {
            _id
          }
          guessed {
            _id
          }
          gag {
            _id
          }
        }
        gags {
            _id
            text
            player {
                _id
                icon
            }
        }
    }
  }
`;

export interface GetCurrentRoundData {
    getCurrentRound: Round;
}