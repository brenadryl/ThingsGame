import { gql } from "@apollo/client";
import { Player } from "../../types";

export const GET_PLAYERS = gql`
  query getPlayers($gameId: ID!) {
    getPlayers(gameId: $gameId) {
        _id
        turn
        points
        name
        active
        icon
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
    players: Player[];
}
export interface GetPlayerData {
    player: Player;
}