import { gql } from '@apollo/client';

export const GAME_STAGE_SUBSCRIPTION = gql`
  subscription OnGameStageChange($gameId: ID!) {
    gameStageChange(gameId: $gameId) {
      _id
      stage
      active
      mode
    }
  }
`;