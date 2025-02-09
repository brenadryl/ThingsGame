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