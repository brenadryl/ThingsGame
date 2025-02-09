import { gql } from "@apollo/client";

export const DELETE_OLD = gql`
  mutation DeleteOld {
    deleteOld {
        deletedRoundCount
        deletedGameCount
        deletedPlayerCount
        deletedGagCount
        deletedGuessCount
    }
  }
`;