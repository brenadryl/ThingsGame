import { gql } from "@apollo/client";
import { Game } from "../../types";

export const GET_GAME = gql`
  query GetGame($id: ID!) {
    getGame(id: $id) {
      _id
      stage
      gameCode
      active
      players {
        _id
        turn
        points
        name
        active
        color
        icon
        guessesMade {
          guessed {
            _id
          }
          gag {
            _id
          }
          isCorrect
        }
        guessesReceived {
          guesser {
            _id
          }
          gag {
            _id
          }
          isCorrect
        }
        gags {
          guessed
          text
          votes
          round {
            _id
            roundNumber
            promptText
          }
        }
      }
      rounds {
        _id
        roundNumber
        finished
        promptText
        turn
        gags {
          player {
            _id
          }
          votes
          guessed
          text
        }
      }
      currentRound {
        _id
        roundNumber
        promptText
        turn
      }
    }
  }
`;

export interface GetGameData {
  getGame: Game;
}