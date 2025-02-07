import { Gag, Game, Guess, Player, Round, Prompt } from './models.js';
import { withFilter } from 'graphql-subscriptions';

function generateRandomString(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const resolvers = {
    Query: {
      prompts: async () => {
        try {
          return await Prompt.find({}); // ✅ Always return a fresh query
        } catch (error) {
          throw new Error("Error fetching prompts: " + error.message);
        }
      },
      getRandomPrompts: async () => {
        const prompts = await Prompt.aggregate([{ $sample: { size: 3 } }]);
        return prompts;
      },
      rounds: () => Round.find(),
      players: () => Player.find(),
      game: () => Game.find(),
      guesses: () => Guess.find(),
      getGags: async (_, { id, roundId, guesserId, playerId, guessed }) => {
        let filter = {};
        if (id){
          filter._id = id;
        }
        if (roundId){
          filter.roundId = roundId;
        }
        if (guesserId){
          filter.guesserId = roundId;
        }
        if (playerId){
          filter.playerId = roundId;
        }
        if (guessed !== undefined){
          filter.guessed = guessed;
        }
        const gags = await Gag.find(filter);
        return gags;
      }
      
    },
    Mutation: {
      createPlayer: async (_, { name, gameCode, color, icon }) => {
        const existingGame = await Game.findOne({ gameCode: gameCode });
        if (existingGame) {
          const existingPlayer = await Player.findOne({ gameId: existingGame._id, name: name });
          if (existingPlayer) {
            throw new UserInputError("A player with this name already exists in this game.");
          }
          const createdAt = Math.floor(Date.now() / 1000);
          const player = new Player({ name, gameId: existingGame._id, color, icon, createdAt });
          await player.save();
          pubsub.publish("newPlayer", { newPlayer: { ...player._doc, gameId: player.gameId } });
          return player;
        } 
        
        throw new UserInputError("No such game.");
      },
  
      updatePlayer: async (_, { id, name, points, color, icon }) => {
        const player = await Player.findOneAndUpdate(
          { _id: id },
          { name, points, color, icon },
          { new: true }
        );
        pubsub.publish("playerChange", { playerChange: { ...player._doc, gameId: player.gameId } });
        return player;
      },

      createGame: async (_, {}) => {
        let code = '';
        let existingCode = true;
        while(existingCode){
          code = generateRandomString(6);
          existingCode = await Game.findOne({ gameCode: code });
        }
        const createdAt = Math.floor(Date.now() / 1000);
        const game = new Game({gameCode: code, createdAt});
        await game.save();
        return game;
      },
  
      updateGame: async (_, { id, active }) => {
        const game = await Game.findOneAndUpdate(
          { _id: id },
          { active },
          { new: true }
        );
        pubsub.publish("gameChange", { gameChange: { ...game._doc, _id: id } });
        return game;
      },
  
      deleteOld: async () => {
        const fiveHoursAgo = Date.now() / 1000 - 18000; // Current time in seconds - 24 hours
        const deletedGames = await Game.deleteMany({
          createdAt: { $lt: fiveHoursAgo }
        });
        const deletedRounds = await Round.deleteMany({
          createdAt: { $lt: fiveHoursAgo }
        });
        const deletedPlayers = await Player.deleteMany({
          createdAt: { $lt: fiveHoursAgo }
        });
        const deletedGags = await Gag.deleteMany({
          createdAt: { $lt: fiveHoursAgo }
        });
        const deletedGuesses = await Guess.deleteMany({
          createdAt: { $lt: fiveHoursAgo }
        });
        return {
          deletedGameCount: deletedGames.deletedCount,
          deletedRoundCount: deletedRounds.deletedCount,
          deletedPlayerCount: deletedPlayers.deletedCount,
          deletedGagCount: deletedGags.deletedCount,
          deletedGuessCount: deletedGuesses.deletedCount
        };
      },

      createRound: async (_, { gameId, roundNumber, promptText, turn }) => {
        const createdAt = Math.floor(Date.now() / 1000);
        const round = new Round({ gameId, roundNumber, promptText, turn, createdAt });
        await round.save();
        await Game.findOneAndUpdate(
          { _id: id },
          { currentRoundId: round._id },
          { new: true }
        );
        pubsub.publish("newRound", { newRound: { ...round._doc, gameId: round.gameId } });
        return round;
      },
  
      updateRound: async (_, { id, turn, stage }) => {
        const round = await Round.findOneAndUpdate(
          { _id: id },
          { turn, stage },
          { new: true }
        );
        pubsub.publish("roundChange", { roundChange: { ...round._doc, gameId: round.gameId } });
        return round;
      },

      createGag: async (_, { roundId, playerId, text }) => {
        const createdAt = Math.floor(Date.now() / 1000);
        const gag = new Gag({ roundId, playerId, text, createdAt });
        await gag.save();
        pubsub.publish("newGag", { newGag: { ...gag._doc, roundId: gag.roundId } });
        return gag;
      },
  
      updateGag: async (_, { id, guesserId, guessed }) => {
        const gag = await Gag.findByIdAndUpdate(
          id,
          { guesserId, guessed },
          { new: true }
        );
        pubsub.publish("gagChange", { gagUpdate: { ...gag._doc, roundId: gag.roundId } });
        return gag;
      },

      updateVote: async (_, { id }) => {
        const gag = await Gag.findByIdAndUpdate(
          id,
          { $inc: { votes: 1 } },
          { new: true }
        );
        if (!gag){
          throw new Error("Gag not found");
        }
        pubsub.publish("voteChange", { voteChange: { ...gag._doc, roundId: gag.roundId } });
        return gag;
      },

      createGuess: async (_, { guesserId, guessedId, gagId }) => {
        const existingGag = await Gag.findById(gagId);
        if (existingGag) {
          const isCorrect = guessedId === existingGag.playerId;
          const createdAt = Math.floor(Date.now() / 1000);
          const guess = new Guess({ guesserId, guessedId, gagId, isCorrect, createdAt });
          await guess.save();
          if (isCorrect) {
            const gag = await Gag.findByIdAndUpdate(
              gagId,
              { guessed: true },
              { new: true }
            );
          }
          pubsub.publish("newGuess", { newGuess: { ...guess._doc, roundId: existingGag.roundId } });
          return guess;
        }

        throw new UserInputError("No such gag.");
      },

      createPrompt: async (_, { text }) => {
        const prompt = new Prompt({ text });
        await prompt.save();
        return prompt;
      },

    },
    Subscription: {
      newPlayer: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('newPlayer'),
          (payload, variables) => {
            return payload.newPlayer.gameId === variables.gameId;
          }
        )
      },
      playerChange: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('playerChange'),
          (payload, variables) => {
            return payload.playerChange.gameId === variables.gameId;
          }
        )
      },
      newGuess: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('newGuess'),
          (payload, variables) => {
            return payload.newGuess.gameId === variables.gameId;
          }
        )
      },
      newGag: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('newGag'),
          (payload, variables) => {
            return payload.newGag.roundId === variables.roundId;
          }
        )
      },
      gagChange: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('gagChange'),
          (payload, variables) => {
            return payload.gagChange.roundId === variables.roundId;
          }
        )
      },
      voteChange: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('voteChange'),
          (payload, variables) => {
            return payload.voteChange.roundId === variables.roundId;
          }
        )
      },
      newRound: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('newRound'),
          (payload, variables) => {
            return payload.newRound.gameId === variables.gameId;
          }
        )
      },
      roundChange: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('roundChange'),
          (payload, variables) => {
            return payload.roundChange.gameId === variables.gameId;
          }
        )
      },
      gameChange: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('gameChange'),
          (payload, variables) => {
            return payload.gameChange.gameId === variables.gameId;
          }
        )
      },
    },
  }

  export default resolvers;