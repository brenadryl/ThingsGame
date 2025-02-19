import { gql } from "@apollo/client";

export const ADD_PLAYER = gql`
  mutation CreatePlayer($name: String!, $gameCode: String!) {
    createPlayer(name: $name, gameCode: $gameCode) {
      _id
      name
      game {
        _id
        gameCode
        stage
        active
      }
      active
    }
  }
`;

export const UPDATE_PLAYER_ICON = gql`
  mutation UpdatePlayerIcon($gameId: ID!, $playerId: ID!, $icon: Int, $color: String) {
    updatePlayerIcon(gameId: $gameId, playerId: $playerId, icon: $icon, color: $color) {
      _id
      icon
      name
      color
    }
  }
`;