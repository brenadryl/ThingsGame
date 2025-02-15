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