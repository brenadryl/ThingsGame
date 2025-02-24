import { Gag, Game, Guess, Player, Round, Prompt, Like } from './models.js';
import { withFilter } from 'graphql-subscriptions';
import pubsub from './pubsub.js';
import { UserInputError } from 'apollo-server-express';

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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
      getCurrentRound: async (_, { gameId }) => {
        const game = await Game.findById(gameId).populate("currentRound")
        const round = await Round.findById(game?.currentRound);
        if (round._id.toString() === game?.currentRound?._id.toString() && round.stage < 2) {
          const gags = await Gag.find({round: round._id}).populate("player")
          const gagIds = gags.map((gag) => gag._id)
          const guesses = await Guess.find({gag: { $in: gagIds}}).sort({createdAt: -1}).populate("guessed").populate("guesser").populate("gag");
          return {
            ...round.toObject(),
            gags,
            guesses,
            game,
          }
        } else {
          throw new Error("Round no longer active")
        }
      },
      getPlayers: async (_, { gameId }) => {
        try {
          const players = await Player.find({game: gameId});
          const playersWithDetails = await Promise.all(
            players.map(async (player) => {
              const guessesMade = await Guess.find({guesser: player._id})
              const guessesReceived = await Guess.find({guessed: player._id})
              const gags = await Gag.find({player: player._id}).populate("player")
              return {
                ...player.toObject(),
                guessesMade,
                guessesReceived,
                gags,
              }
            })
          );
          return playersWithDetails;
        } catch (error) {
          console.error("Error fetching players.", error)
          throw new Error("Failed to fetch players")
        }
      },
      getPlayer: async (_, { id }) => {
        try {
          const player = await Player.findById(id);
          if (!player) {
            throw new Error("Player not found");
          }
          const guessesMade = await Guess.find({guesser: player._id})
          const guessesReceived = await Guess.find({guessed: player._id})
          const gags = await Gag.find({player: player._id}).populate("player")

          return {
            ...player.toObject(),
            guessesMade,
            guessesReceived,
            gags,
          }
        } catch (error) {
          console.error("Error fetching player", error)
          throw new Error("Failed to fetch player")
        }
      },
      getGame: async (_, { id }) => {
        try {
          const game = await Game.findById(id).populate("currentRound");
          if (!game) {
            throw new Error("Game not found");
          }
          const players = await Player.find({game: game._id}).sort({createdAt: 1})
          const rounds = await Round.find({game: game._id})
          const currentGags = await Gag.find({round: game.currentRound}).populate("player")
          const currentLikes = await Like.find({round: game.currentRound})
          let currentGuesses = []; 
          let playersWithDetails = [];
          if (players && players.length > 0) {
            playersWithDetails = await Promise.all(
              players.map(async (player) => {
                const guessesMade = await Guess.find({guesser: player._id})
                const guessesReceived = await Guess.find({guessed: player._id})
                const gags = await Gag.find({player: player._id}).populate("round").populate("player")
                return {
                  ...player.toObject(),
                  guessesMade,
                  guessesReceived,
                  gags,
                }
              })
            );
          }

          let roundsWithDetails = [];

          if (rounds && rounds.length > 0) {
            roundsWithDetails = await Promise.all(
              rounds.map(async (round) => {
                const gags = await Gag.find({round: round._id}).populate("round").populate("player")
                const likes = await Like.find({round: round._id})
                return {
                  ...round.toObject(),
                  gags,
                  likes,
                }
              })
            );
          }


          if (currentGags && currentGags.length > 0) {
            const gagIds = currentGags.map((gag) => gag._id)
            currentGuesses = await Guess.find({gag: { $in: gagIds}}).sort({createdAt: -1});
          }
          const currentRound = game.currentRound ? {...game.currentRound.toObject(), gags: currentGags, guesses: currentGuesses, likes: currentLikes} : undefined;
          return {
            ...game.toObject(),
            players: playersWithDetails,
            rounds: roundsWithDetails,
            currentRound,
          }
        } catch (error) {
          console.error("Error fetching game", error)
          throw new Error("Failed to fetch game")
        }
      },
    },
    Mutation: {
      createPlayer: async (_, { name, gameCode }) => {
        try {
          const existingGame = await Game.findOne({ gameCode: gameCode });
          if (existingGame && existingGame.active && existingGame.stage === 1) {
            const existingPlayer = await Player.findOne({ game: existingGame._id, name: name });
            if (existingPlayer) {
              throw new UserInputError("A player with this name already exists in this game.");
            }
            const players = await Player.find({game: existingGame._id})
            if (players.length > 19) {
              throw new UserInputError("This game is full.");
            }
            const TOTAL_ICONS = 48
            const assignedIcons = players.map(player => player.icon);
            let availableIcon = -1;
            let i = TOTAL_ICONS;
            while (availableIcon === -1) {
              if (!assignedIcons.includes(i)) { 
                availableIcon = i;
              }
              i--;
            }
            if ( availableIcon === -1) {
              throw new UserInputError("No available Icons")
            }

            const createdAt = Math.floor(Date.now() / 1000);
            const player = new Player({ name, game: existingGame._id, createdAt, color: '#FF5733', icon: availableIcon, turn: players.length });
            await player.save();
            await player.populate('game');
            pubsub.publish("newPlayer", { newPlayer: { ...player.toObject(), gameId: existingGame._id } });
            return player;
          }
          throw new UserInputError("No such game.");
        } catch (error) {
            throw error;
        }
      },
  
      updatePlayer: async (_, { id, name, points }) => {
        const player = await Player.findOneAndUpdate(
          { _id: id },
          { name, points },
          { new: true }
        );
        if (!player) {
          throw new Error(`Player with id ${id} not found.`);
        }
        if (!player.game) {
          throw new Error(`Player with id ${id} is not associated with any game.`);
        }
        pubsub.publish("playerChange", { playerChange: { ...player.toObject(), gameId: player.game } });
        return player;
      },

      updatePlayerIcon: async (_, { gameId, playerId, icon, color }) => {
        try {
          const existingPlayer = await Player.findOne({game: gameId, icon: icon})
          if (existingPlayer) {
            throw new UserInputError("A player this avatar has already been chosen");
          }
          const player = await Player.findOneAndUpdate(
            { _id: playerId },
            { color, icon },
            { new: true }
          ).populate("game");

          if (!player) {
            throw new UserInputError(`Player with id ${id} not found.`);
          }
          
          if (!player.game || player.game._id.toString() !== gameId) {
            throw new UserInputError(`Player with id ${id} is not associated with this game.`);
          }

          pubsub.publish("avatarSelected", { avatarSelected: { ...player.toObject(), gameId: gameId } });
          return player;
        } catch (error) {
            throw error;
        }
      },

      createLike: async (_, {playerId, roundId, gagId}) => {
        const createdAt = Math.floor(Date.now() / 1000);
        const existingLike = await Like.findOne({round: roundId, player: playerId})
        if (existingLike) {
          await Like.findByIdAndDelete(existingLike._id)
          await Gag.findByIdAndUpdate(
            gagId,
            { $inc: { votes: -1 } },
            { new: true }
          )
        }
        const like = new Like({player: playerId, createdAt, round: roundId, gag: gagId});
        await like.save();
        await Gag.findByIdAndUpdate(
          gagId,
          { $inc: { votes: 1 } },
          { new: true }
        )
        pubsub.publish("newLike", { newLike: { ...like.toObject(), roundId: roundId } });
        return like;
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
  
      updateGameStage: async (_, { id, active, stage }) => {
        try {
          const game = await Game.findByIdAndUpdate(
            id,
            { active, stage },
            { new: true }
          );
          if (!game) {
            throw new Error("Game not found.")
          }
          pubsub.publish("gameStageChange", { gameStageChange: game });
          return game;
        } catch (error) {
          console.error("Error updating game stage:", error)
          throw new Error("Failed to update game stage.")
        }
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

      createRound: async (_, { gameId, promptText, turn }) => {
        const game = Game.findById(gameId)
        if (game.currentRound && !game.currentRound.stage != 2) {
          throw new Error("Current round not yet over");
        }
        const createdAt = Math.floor(Date.now() / 1000);
        const round = new Round({ game: gameId, promptText, turn, createdAt });
        await round.save();
        await Game.findOneAndUpdate(
          { _id: gameId },
          { currentRound: round._id },
          { new: true }
        );
        pubsub.publish("newRound", { newRound: { ...round.toObject(), gameId: gameId } });
        return round;
      },
  
      updateRound: async (_, { id, turn, stage }) => {
        const round = await Round.findOneAndUpdate(
          { _id: id },
          { turn, stage },
          { new: true }
        );
        pubsub.publish("roundChange", { roundChange: { ...round.toObject(), gameId: round.game } });
        return round;
      },

      createGag: async (_, { roundId, playerId, text }) => {
        const round = await Round.findById(roundId)
        if (!round || round.stage !== 1) {
          throw new UserInputError("Round is no longer accepting submissions");
        }
        const game = await Game.findById(round.game).populate("currentRound")
        if (round._id.toString() !== game.currentRound._id.toString()) {
          throw new UserInputError("Game has moved on to a new round");
        }
        const player = await Player.findById(playerId)
        if (round.game._id.toString() !== player.game._id.toString()) {
          throw new UserInputError("Player is not in Game");
        }
        const sameResponse = await Gag.findOne({ text, round: round._id.toString() });
        if (sameResponse) {
          throw new UserInputError("That response has already been submitted to this round by another player. Try another.");
        }
        const existingGag = await Gag.findOne({ player: player._id.toString(), round: round._id.toString() });
        if (existingGag) {
          throw new UserInputError("A response has already been submitted to this round from this player.");
        }
        const createdAt = Math.floor(Date.now() / 1000);
        const gag = new Gag({ round: roundId, player: playerId, text, createdAt });
        await gag.save();
        pubsub.publish("gagUpdate", { gagUpdate: { ...gag.toObject(), roundId: roundId } });
        return gag;
      },
  
      updateGag: async (_, { id, votes }) => {
        console.log("update gag id: ", id)
        console.log("update gag votes: ", votes)
        const gag = await Gag.findByIdAndUpdate(
          id,
          { $inc: { votes: votes } },
          { new: true }
        ).populate("round").populate("player");
        const game = await Game.findById(gag.round.game)
        console.log("GAGGGGG ", gag)
        return gag;
      },

      createGuess: async (_, { gagId, guesserId, guessedId }) => {
        const existingGag = await Gag.findById(gagId).populate("player").populate("round");
        if (existingGag) {
          const isCorrect = guessedId.toString() === existingGag.player._id.toString();
          const createdAt = Math.floor(Date.now() / 1000);
          const guess = new Guess({ guesser: guesserId, guessed: guessedId, gag: gagId, isCorrect, createdAt });
          await guess.save();
          const savedGuess = await Guess.findById(guess._id).populate("guesser").populate("guessed").populate("gag");
          if (!savedGuess || !savedGuess._id) throw new Error("Failed to retrieve saved guess")
          if (isCorrect) {
            const player = await Player.findByIdAndUpdate(guesserId, {$inc: { points: 1 }}, {new: true})
            const gag = await Gag.findByIdAndUpdate(
              gagId,
              { guessed: true, guesser: player._id },
              { new: true }
            );
            const guessedGags = await Gag.find({round: existingGag.round, guessed: true}).populate("player")
            const players = await Player.find({game: existingGag.round.game})
            if(guessedGags.length === players.length) {
              const round = await Round.findByIdAndUpdate(existingGag.round._id.toString(), {stage: 2}, {new: true}).populate("game")
              const game = await Game.findByIdAndUpdate(round.game._id.toString(), {stage: 3}, {new: true})
              pubsub.publish("gameStageChange", { gameStageChange: game });
              console.log("GAME UPDATE ", game)
              console.log("ROUND UPDATE ", round)
            }
            pubsub.publish("gagUpdate", { gagUpdate: { ...gag.toObject(), roundId: existingGag.round._id } });
          }
          pubsub.publish("newGuess", { newGuess: { ...savedGuess.toObject(), roundId: existingGag.round._id } });
          return savedGuess;
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
          () => {
            console.log("subscription started for new player")
            return pubsub.asyncIterableIterator('newPlayer')
          },
          (payload, variables) => { 
            return payload.newPlayer.gameId.toString() === variables.gameId.toString();
          }
        ),
        resolve: async (payload) => {
          try {
            const players = await Player.find({game: payload.newPlayer.gameId}).sort({createdAt: 1});
            const playersWithDetails = await Promise.all(
              players.map(async (player) => {
                const guessesMade = await Guess.find({guesser: player._id})
                const guessesReceived = await Guess.find({guessed: player._id})
                const gags = await Gag.find({player: player._id}).populate("player")
                return {
                  ...player.toObject(),
                  guessesMade,
                  guessesReceived,
                  gags,
                }
              })
            );
            return playersWithDetails;
          } catch (error) {
            console.error("Error fetching players for subscription")
            throw new Error("Failed to fetch players for subscription")
          }
        }
      },
      avatarSelected: {
        subscribe: withFilter(
          () => {
            console.log("subscription started for new avatar")
            return pubsub.asyncIterableIterator('avatarSelected')
          },
          (payload, variables) => {
            return payload.avatarSelected.gameId.toString() === variables.gameId.toString();
          }
        ),
        resolve: async (payload) => {
          try {
            const players = await Player.find({game: payload.avatarSelected.gameId}).sort({createdAt: 1});
            const playersWithDetails = await Promise.all(
              players.map(async (player) => {
                const guessesMade = await Guess.find({guesser: player._id})
                const guessesReceived = await Guess.find({guessed: player._id})
                const gags = await Gag.find({player: player._id}).populate("player")
                return {
                  ...player.toObject(),
                  guessesMade,
                  guessesReceived,
                  gags,
                }
              })
            );
            return playersWithDetails;
          } catch (error) {
            console.error("Error fetching avatars for subscription")
            throw new Error("Failed to fetch avatars for subscription")
          }
        }
      },
      gameStageChange: {
        subscribe: withFilter(
          () => pubsub.asyncIterableIterator('gameStageChange'),
          (payload, variables) => {
            return payload.gameStageChange._id.toString() === variables.gameId.toString();
          }
        )
      },
      newRound: {
        subscribe: withFilter(
          () => pubsub.asyncIterableIterator('newRound'),
          (payload, variables) => {
            return payload.newRound.gameId.toString() === variables.gameId.toString();
          }
        )
      },
      newGuess: {
        subscribe: withFilter(
          () => pubsub.asyncIterableIterator('newGuess'),
          (payload, variables) => {
            return payload.newGuess.roundId.toString() === variables.roundId.toString();
          }
        ),
        resolve: async (payload) => {
          try {
            const gags = await Gag.find({round: payload.newGuess.roundId}).populate("player");
            const gagIds = gags.map((gag) => gag._id)
            const guesses = await Guess.find({gag: { $in: gagIds}}).sort({createdAt: -1}).populate("guessed").populate("guesser").populate("gag");
            const returnGuesses = guesses.map((guess) => {return {...guess.toObject()}})
            return returnGuesses;
          } catch (error) {
            console.error("Error fetching guesses for subscription")
            throw new Error("Failed to fetch guesses for subscription")
          }
        }
      },
      newLike: {
        subscribe: withFilter(
          () => pubsub.asyncIterableIterator('newLike'),
          (payload, variables) => {
            return payload.newLike.roundId.toString() === variables.roundId.toString();
          }
        ),
        resolve: async (payload) => {
          try {
            const likes = await Like.find({round: payload.newLike.roundId})
            return likes;
          } catch (error) {
            console.error("Error fetching likes for subscription")
            throw new Error("Failed to fetch likes for subscription")
          }
        }
      },
      gagUpdate: {
        subscribe: withFilter(
          () => {
            console.log("subscription started for gag update")
            return pubsub.asyncIterableIterator('gagUpdate')
          },
          (payload, variables) => {
            return payload.gagUpdate.roundId.toString() === variables.roundId.toString();
          }
        ),
        resolve: async (payload) => {
          try {
            const gags = await Gag.find({round: payload.gagUpdate.roundId}).sort({text: 1}).populate("player").populate("guesser");
            return gags;
          } catch (error) {
            console.error("Error fetching gags for subscription")
            throw new Error("Failed to fetch gags for subscription")
          }
        }
      },
      playerChange: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('playerChange'),
          (payload, variables) => {
            return payload.playerChange.gameId === variables.gameId;
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
      roundChange: {
        subscribe: withFilter(
          () => pubsub.asyncIterator('roundChange'),
          (payload, variables) => {
            return payload.roundChange.gameId === variables.gameId;
          }
        )
      },
    },
  }

  export default resolvers;