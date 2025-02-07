import { gql } from "@apollo/client";

export const CREATE_PLAYER = gql`
  mutation CreatePlayer($name: String!, $gameCode: String!) {
    createPlayer($name: String!, $gameCode: String!) {
      id
      name
      gameCode
    }
  }
`;