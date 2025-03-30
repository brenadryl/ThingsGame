import { gql } from "@apollo/client";
import { Player } from "../../types";

export const GET_PLAYERS = gql`
  query getPlayers($gameId: ID!, $roundId: ID) {
    getPlayers(gameId: $gameId, roundId: $roundId) {
        _id
        turn
        points
        name
        active
        icon
        color
        likesGiven {
          _id
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
          _id
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
            guessed
            createdAt
            text
            votes
            round {
                _id
                promptText
            }
        }
    }
  }
`;

export const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
        _id
        turn
        points
        icon
        name
        active
        color
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
            round {
                _id
                promptText
            }
        }
    }
  }
`;

export interface GetPlayersData {
  getPlayers: Player[];
}
export interface GetPlayerData {
    player: Player;
}