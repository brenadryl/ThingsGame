import { gql } from "@apollo/client";
import { Gag } from "../../types";

export const GET_GAGS = gql`
  query GetGags($roundId: ID!) {
    getGags(roundId: $roundId) {
      _id
      createdAt
      text
      guessed
      player {
        _id
        icon
        color
        name
      }
      votes
      round {
        _id
        promptText
      }
    }
  }
`;


export interface GetGagsData {
    getGags: Gag[];
}