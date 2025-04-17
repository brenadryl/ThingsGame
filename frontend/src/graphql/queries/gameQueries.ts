import { gql } from "@apollo/client";
import { Game } from "../../types";

export const GET_GAME = gql`
  query GetGame($id: ID!, $roundId: ID) {
    getGame(id: $id, roundId: $roundId) {
      _id
      stage
      gameCode
      mode
      minutes
      active
      players {
        _id
        turn
        points
        name
        active
        color
        icon
        likesGiven {
          player {
            _id
          }
          gag {
            _id
            player {
              _id
            }
          }
        }
        likesReceived {
          player {
            _id
          }
          gag {
            _id
            player {
              _id
            }
          }
        }
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
          _id
          createdAt
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
        createdAt
        turn
        likes {
          _id
          player {
            _id
          }
          gag {
            _id
          }
        }
        gags {
          _id
          player {
            _id
            icon
          }
          votes
          guessed
          text
        }
        guesses {
          isCorrect
          createdAt
          guesser {
            _id
            icon
            name
            color
          }
          guessed {
            _id
            icon
            name
            color
          }
          gag {
            _id
          }
        }
      }
      currentRound {
        _id
        stage
        promptText
        createdAt
        turn
        likes {
          _id
          player {
            _id
          }
          gag {
            _id
          }
        }
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
          round {
            _id
          }
        }
        guesses {
          isCorrect
          createdAt
          guesser {
            _id
            icon
            name
            color
          }
          guessed {
            _id
            icon
            name
            color
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