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
            promptText
          }
        }
      }
      rounds {
        _id
        stage
        promptText
        turn
        gags {
          player {
            _id
            icon
          }
          votes
          guessed
          text
        }
      }
      currentRound {
        _id
        stage
        promptText
        turn
        gags {
          _id
          guessed
          text
          votes
          player {
            _id
            icon
          }
          guesser {
            _id
          }
        }
        guesses {
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
      }
    }
  }
`;

export interface GetGameData {
  getGame: Game;
}