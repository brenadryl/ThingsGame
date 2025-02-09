import { gql } from "@apollo/client";

export const CREATE_GAME = gql`
  mutation CreateGame {
    createGame {
      _id
      gameCode
    }
  }
`;

export const CHANGE_GAME_MUTATION = gql`
  mutation ChangeGame($id: ID!, $active: Boolean, $stage: Int ) {
    updateGameStage(id: $id, active: $active, stage: $stage) {
      _id
      stage
      active
    }
  }
`;