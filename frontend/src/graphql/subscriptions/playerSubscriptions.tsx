import { gql } from '@apollo/client';

export const NEW_PLAYER_SUBSCRIPTION = gql`
  subscription OnNewPlayer($gameId: ID!) {
    newPlayer(gameId: $gameId) {
        _id
        points
        turn
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
          votes
          round {
            _id
            promptText
          }
        }
      }
  }
`;

export const AVATAR_SELECTION_SUBSCRIPTION = gql`
  subscription AvatarSelection($gameId: ID!) {
    avatarSelected(gameId: $gameId) {
      _id
      name
      icon
      color
    }
  }
`;