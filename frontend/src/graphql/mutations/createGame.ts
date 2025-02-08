import { gql } from "@apollo/client";
// import { Game } from "../../types";

export const CREATE_GAME = gql`
  mutation CreateGame {
    createGame {
      _id
      gameCode
      # Include other fields as necessary
    }
  }
`;