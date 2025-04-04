import { useSubscription } from '@apollo/client';
import { GAME_STAGE_SUBSCRIPTION } from '../graphql/subscriptions/gameSubscriptions';
import { GameState, useGameStore } from '../stores/useGameStore';
import { Game } from '../types';

export const useGameSubscription = (
  gameId: string | undefined,
  setErrorMessage: (msg: string) => void
) => {
    const setGame = useGameStore((state: GameState) => state.setGame);
    const game = useGameStore((state: GameState) => state.game);

    useSubscription(GAME_STAGE_SUBSCRIPTION, {
        variables: { gameId },
        skip: !gameId,
        onSubscriptionData: ({ subscriptionData }) => {
            try {
                const stageChange = subscriptionData?.data?.gameStageChange;
                if (!stageChange || !game) return;
                console.log("stageChange", stageChange)
        
                const updatedGame: Game = {
                  ...game,
                  stage: stageChange.stage,
                  active: stageChange.active,
                  mode: stageChange.mode
                };
                console.log("updatedGame", updatedGame)
                setGame(updatedGame);
            } catch (e: any) {
                console.error(e);
                setErrorMessage(e.message || "Error processing game updates");
            }
        },
    });
};