import { Gag, Game, Guess, Player, Round, Prompt, Like } from './models.js';
import { withFilter } from 'graphql-subscriptions';
import pubsub from './pubsub.js';
import { UserInputError } from 'apollo-server-express';
import { FUN_COLORS } from './constants.js';
import mongoose from 'mongoose';

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
          return await Prompt.find({});
        } catch (error) {
          throw new Error("Error fetching prompts: " + error.message);
        }
      },
      getRandomPrompts: async () => {
        const prompts = await Prompt.aggregate([{ $sample: { size: 3 } }]);
        return prompts;
      },
      getCurrentRound: async (_, { gameId }) => {
        const game = await Game.findById(gameId).populate("currentRound").lean();
        if (!game) {
          throw new Error("Game not found");
        }
        if (!game.currentRound) {
          throw new Error("No current round set for this game");
        }
      
        const round = await Round.findById(game.currentRound._id).lean();
        if (!round) {
          throw new Error("Round not found");
        }
      
        if (!round._id.equals(game.currentRound._id) || round.stage >= 2) {
          throw new Error("Round no longer active");
        }
      
        const gags = await Gag.find({ round: round._id })
          .populate("player")
          .lean();
        const gagIds = gags.map((gag) => gag._id);
        const guesses = await Guess.find({ gag: { $in: gagIds } })
          .sort({ createdAt: -1 })
          .populate("guessed")
          .populate("guesser")
          .populate("gag")
          .lean();
      
        return {
          ...round,
          gags,
          guesses,
          game,
        };
      },
      getPlayers: async (_, { gameId, roundId }) => {
        try {
          const playersWithDetails = await Player.aggregate([
            // Match players for the given game.
            { 
              $match: { game: new mongoose.Types.ObjectId(gameId) }
            },
            // Lookup for likesGiven: likes where the Like's player equals this player's _id.
            { 
              $lookup: {
                from: "likes",
                let: { playerId: "$_id" },
                pipeline: [
                  { 
                    $match: { 
                      $expr: { $eq: ["$player", "$$playerId"] }
                    }
                  },
                  // Join the gag referenced in the like.
                  {
                    $lookup: {
                      from: "gags",
                      localField: "gag",
                      foreignField: "_id",
                      as: "gagData"
                    }
                  },
                  { 
                    $unwind: { 
                      path: "$gagData", 
                      preserveNullAndEmptyArrays: true 
                    } 
                  },
                  // Now join the player for the gag.
                  {
                    $lookup: {
                      from: "players",
                      localField: "gagData.player",
                      foreignField: "_id",
                      as: "gagData.player"
                    }
                  },
                  { 
                    $unwind: { 
                      path: "$gagData.player", 
                      preserveNullAndEmptyArrays: true 
                    } 
                  },
                  // Replace the original gag field with the populated version.
                  {
                    $addFields: { 
                      gag: "$gagData" 
                    }
                  },
                  { 
                    $project: { 
                      gagData: 0 
                    }
                  }
                ],
                as: "likesGiven"
              }
            },
            // Lookup for likesReceived: likes where the associated gag's player equals this player's _id.
            { 
              $lookup: {
                from: "likes",
                let: { playerId: "$_id" },
                pipeline: [
                  // Lookup the gag document referenced by the like.
                  { 
                    $lookup: {
                      from: "gags",
                      localField: "gag",
                      foreignField: "_id",
                      as: "gagObj"
                    }
                  },
                  { $unwind: "$gagObj" },
                  // Only include likes whose gagObj.player equals the current player's _id.
                  { 
                    $match: { 
                      $expr: { $eq: [ "$gagObj.player", "$$playerId" ] } 
                    }
                  },
                  // Populate the gagObj's player field by joining the players collection.
                  {
                    $lookup: {
                      from: "players",
                      localField: "gagObj.player",
                      foreignField: "_id",
                      as: "gagObj.player"
                    }
                  },
                  { 
                    $unwind: { 
                      path: "$gagObj.player", 
                      preserveNullAndEmptyArrays: true 
                    } 
                  },
                  // Replace the original gag field with the fully populated gagObj.
                  {
                    $addFields: { 
                      gag: "$gagObj" 
                    }
                  },
                  { 
                    $project: { 
                      gagObj: 0 
                    }
                  }
                ],
                as: "likesReceived"
              }
            },
            // Lookup for guessesMade: guesses where this player's _id is the guesser.
            { 
              $lookup: {
                from: "guesses",
                localField: "_id",
                foreignField: "guesser",
                as: "guessesMade"
              }
            },
            // Lookup for guessesReceived: guesses where this player's _id is the one being guessed.
            { 
              $lookup: {
                from: "guesses",
                localField: "_id",
                foreignField: "guessed",
                as: "guessesReceived"
              }
            },
            // Lookup for gags: all gags where this player's _id matches the gag's player,
            // and join the round details so that round.promptText is available.
            {
              $lookup: {
                from: "gags",
                let: { playerId: "$_id" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$player", "$$playerId"] } } },
                  {
                    $lookup: {
                      from: "rounds",
                      localField: "round",
                      foreignField: "_id",
                      as: "round"
                    }
                  },
                  // Unwind the round array so that each gag has a single round object.
                  { $unwind: { path: "$round", preserveNullAndEmptyArrays: true } }
                ],
                as: "gags"
              }
            }
          ]);
          return playersWithDetails;
        } catch (error) {
          console.error("Error fetching players.", error);
          throw new Error("Failed to fetch players");
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
      getGags: async (_, { roundId }) => {
        try {
          const gags = await Gag.find({round: roundId}).populate("player").populate("round")
          if (!gags) {
            throw new Error("Gags not found");
          }

          return gags;
        } catch (error) {
          console.error("Error fetching gags", error)
          throw new Error("Failed to fetch gags")
        }
      },
      getGame: async (_, { id, roundId}) => {
        try {
          let queryId;
          if (mongoose.Types.ObjectId.isValid(id)) {
            queryId = new mongoose.Types.ObjectId(id);
          } else {
            queryId = id;
          }
          const gameWithDetails = await Game.aggregate([
            { $match: { _id: queryId } },
            { 
              $lookup: {
                from: "players",
                localField: "_id",
                foreignField: "game",
                pipeline: [
                  { $sort: { 'createdAt': 1 } }
                ],
                as: "players"
              }
            },
            { 
              $lookup: {
                from: "rounds",
                let: { gameId: "$_id" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$game", "$$gameId"] } } },
                  {
                    $lookup: {
                      from: "gags",
                      localField: "_id",
                      foreignField: "round",
                      as: "gags",
                    },
                  },
                  {
                    $lookup: {
                      from: "likes",
                      localField: "_id",
                      foreignField: "round",
                      as: "likes",
                    },
                  },
                  {
                    $lookup: {
                      from: "guesses",
                      let: { roundId: "$_id" },
                      pipeline: [
                        { $sort: { 'createdAt': -1 } },
                        { 
                          $match: { 
                            $expr: { $eq: ["$round", "$$roundId"] } 
                          } 
                        },
                        {
                          $lookup: {
                            from: "players",
                            localField: "guesser",
                            foreignField: "_id",
                            as: "guesser"
                          }
                        },
                        { 
                          $unwind: { 
                            path: "$guesser", 
                            preserveNullAndEmptyArrays: true 
                          } 
                        },
                        {
                          $lookup: {
                            from: "players",
                            localField: "guessed",
                            foreignField: "_id",
                            as: "guessed"
                          }
                        },
                        { 
                          $unwind: { 
                            path: "$guessed", 
                            preserveNullAndEmptyArrays: true 
                          } 
                        }
                      ],
                      as: "guesses"
                    }
                  },
                ],
                as: "rounds"
              }
            },
            { 
              $lookup: {
                from: "rounds",
                localField: "currentRound",
                foreignField: "_id",
                as: "currentRound"
              }
            },
            { 
              $unwind: { 
                path: "$currentRound", 
                preserveNullAndEmptyArrays: true 
              } 
            },
            { 
              $lookup: {
                from: "gags",
                localField: "currentRound._id",
                foreignField: "round",
                as: "currentRound.gags"
              }
            },
            { 
              $lookup: {
                from: "likes",
                localField: "currentRound._id",
                foreignField: "round",
                as: "currentRound.likes"
              }
            },
            { 
              $lookup: {
                from: "guesses",
                let: { roundId: "$currentRound._id" },
                pipeline: [
                  { $sort: { 'createdAt': -1 } },
                  { 
                    $match: { 
                      $expr: { $eq: ["$round", "$$roundId"] } 
                    }
                  },
                  {
                    $lookup: {
                      from: "players",
                      localField: "guesser",
                      foreignField: "_id",
                      as: "guesser"
                    }
                  },
                  { 
                    $unwind: { 
                      path: "$guesser", 
                      preserveNullAndEmptyArrays: true 
                    } 
                  },
                  {
                    $lookup: {
                      from: "players",
                      localField: "guessed",
                      foreignField: "_id",
                      as: "guessed"
                    }
                  },
                  { 
                    $unwind: { 
                      path: "$guessed", 
                      preserveNullAndEmptyArrays: true 
                    } 
                  }
                ],
                as: "currentRound.guesses"
              }
            },
          ]);
        
          if (!gameWithDetails.length) {
            console.log("Game not found")
            throw new Error("Game not found");
          }
        
          const gameResult = gameWithDetails[0];
          if (!gameResult.currentRound._id) {
            console.log("deleting current round")
            delete gameResult.currentRound;
          }
          
          return gameResult;
        } catch (error) {
          console.error("Error fetching game", error);
          throw new Error("Failed to fetch game");
        }
      },
    },
    Mutation: {
      createPlayer: async (_, { name, gameCode }) => {
        try {
          const existingGame = await Game.findOne({ gameCode: gameCode });
          if (existingGame && existingGame.active) {
            if (name === "SPECTATORRRRRRRRRRRRR") {
              return {_id: "spectator", name: "spectator", active: false, game: existingGame};
            }
            if (existingGame.stage !== 1) {
              return {_id: "spectator", name: "started", active: false, game: existingGame};
            }
            const existingPlayer = await Player.findOne({ game: existingGame._id, name: name });
            if (existingPlayer) {
              throw new UserInputError("A player with this name already exists in this game.");
            }
            const players = await Player.find({game: existingGame._id})
            if (players.length > 19) {
              return {_id: "spectator", name: "full", active: false, game: existingGame};
              // throw new UserInputError("This game is full.");
            }
            const TOTAL_ICONS = 57
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
            const color = FUN_COLORS[Math.floor(Math.random() * FUN_COLORS.length)];
            const player = new Player({ name, game: existingGame._id, createdAt, color, icon: availableIcon, turn: players.length });
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
        try {
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

        } catch (error) {
          console.error("Error updating player:", error)
          throw new Error("Failed to update the player.")
        }
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
        try {
          const createdAt = Math.floor(Date.now() / 1000);
    
          const updatedLike = await Like.findOneAndUpdate(
            { player: playerId, round: roundId },
            { player: playerId, createdAt, round: roundId, gag: gagId },
            { upsert: true, new: true }
          );
    
          await Gag.findByIdAndUpdate(gagId, { $inc: { votes: 1 } });
    
          pubsub.publish("newLike", { newLike: { ...updatedLike.toObject(), roundId } });
    
          return updatedLike;
        } catch (error) {
          console.error("Error creating like:", error)
          throw new Error("Failed to create like.")
        }
      },

      createGame: async (_, {}) => {
        let code = '';
        let existingCode = true;
        try {
          while(existingCode){
            code = generateRandomString(6);
            existingCode = await Game.findOne({ gameCode: code });
          }
          const createdAt = Math.floor(Date.now() / 1000);
          const game = new Game({gameCode: code, createdAt});
          await game.save();
          return game;
        } catch (error) {
          console.error("Error creating game:", error)
          throw new Error("Failed to create game.")
        }
      },
  
      updateGameStage: async (_, { id, active, stage, mode, minutes }) => {
        console.log("minutes", minutes)
        try {
          const game = await Game.findByIdAndUpdate(
            id,
            { active, stage, mode, minutes },
            { new: true }
          );
          console.log("GAMERMEMEME", game)
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
        await Like.deleteMany({
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
        try {
          const game = await Game.findById(gameId).populate("currentRound")
          if (game?.currentRound && game?.currentRound.stage !== 2) {
            console.log("GAMEISSSS", game)
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
          //brennah
          const duration = ((game?.minutes || 5) * 60 * 1000) + 2000;
          console.log("duration", duration)
          console.log("GAMEIS: ", game)
          setTimeout(async () => {
            try {
              const players = await Player.find({ game: gameId });
              const submittedGags = await Gag.find({ round: round._id });
              const submittedPlayerIds = new Set(submittedGags.map(g => g.player.toString()));
          
              const missingPlayers = players.filter(p => !submittedPlayerIds.has(p._id.toString()));
          
              for (const player of missingPlayers) {
                const fallbackGag = new Gag({
                  round: round._id,
                  player: player._id,
                  text: "{*PLAYER DID NOT FINISH IN TIME*}",
                  createdAt: Math.floor(Date.now() / 1000)
                });
                await fallbackGag.save();
                const populatedGag = await Gag.findById(fallbackGag._id).populate("player");

                console.log("SUBMITTING GAGS FROM TIME ELAPSED gagUpdate: ", { ...populatedGag.toObject(), roundId: round._id.toString() })
                pubsub.publish("gagUpdate", { gagUpdate: { ...populatedGag.toObject(), roundId: round._id.toString() } });
              }
            } catch (error) {
              console.error("Error auto-submitting fallback gags:", error);
            }
          }, duration);
          //brennah
          pubsub.publish("newRound", { newRound: { ...round.toObject(), gameId: gameId } });
          return round;
        } catch (error) {
          console.error("Error creating new round:", error)
          throw new Error("Failed to create a new round.")
        }
      },
  
      updateRound: async (_, { id, turn, stage }) => {
        try {
          const round = await Round.findOneAndUpdate(
            { _id: id },
            { turn, stage },
            { new: true }
          );
          pubsub.publish("roundChange", { roundChange: { ...round.toObject(), gameId: round.game } });
          return round;

        } catch (error) {
          console.error("Error updating round:", error)
          throw new Error("Failed to update the round.")
        }
      },

      createGag: async (_, { roundId, playerId, text }) => {
        try {
          const round = await Round.findById(roundId)
          if (!round || round.stage !== 1) {
            throw new UserInputError("Round is no longer accepting submissions");
          }
          const game = await Game.findById(round.game).populate("currentRound")
          if (round._id.toString() !== game?.currentRound._id.toString()) {
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
          console.log("creating gag and triggering subscription")
          console.log("gagUpdate: ", { ...gag.toObject(), roundId: roundId })
          pubsub.publish("gagUpdate", { gagUpdate: { ...gag.toObject(), roundId: roundId } });
          return gag;
        } catch (error) {
          console.error("Error creating the response:", error)
          throw new Error("Failed to create a new response.")
        }
      },
  
      updateGag: async (_, { id, votes }) => {
        try {
          const gag = await Gag.findByIdAndUpdate(
            id,
            { $inc: { votes: votes } },
            { new: true }
          ).populate("round").populate("player");
          return gag;
        } catch (error) {
          console.error("Error updating the response:", error)
          throw new Error("Failed to update the response.")
        }
      },

      createGuess: async (_, { gagId, guesserId, guessedId }) => {
        try {
          const existingGag = await Gag.findById(gagId).populate("player").populate("round");
          if (existingGag) {
            const isCorrect = guessedId.toString() === existingGag.player._id.toString();
            const createdAt = Math.floor(Date.now() / 1000);
            const guess = new Guess({ round: existingGag.round._id.toString(), guesser: guesserId, guessed: guessedId, gag: gagId, isCorrect, createdAt });
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
                const roundLikes = await Like.find({round: round._id})
                const likeCounts = roundLikes.reduce((acc, like) => {
                  acc[like.gag] = (acc[like.gag] || 0) + 1
                  return acc;
                }, {})
                const maxLikes = Math.max(...Object.values(likeCounts));
                console.log("maxLikes: ", maxLikes)

                const mostLikedGagIds = Object.keys(likeCounts).filter((gagId) => likeCounts[gagId] === maxLikes)
                console.log("mostLikedGagIds: ", mostLikedGagIds)
                console.log("(mostLikedGagIds.length === 1: ", mostLikedGagIds.length === 1)
                if (mostLikedGagIds.length === 1) {
                  const favGag = await Gag.findById(mostLikedGagIds[0]).populate("player");
                  console.log("playerID: ", favGag.player._id)
                  await Player.findByIdAndUpdate(
                    favGag.player._id,
                    {$inc: { points: 1 }},
                    { new: true }
                  )
                }
              }
              pubsub.publish("gagUpdate", { gagUpdate: { ...gag.toObject(), roundId: existingGag.round._id } });
            }
            pubsub.publish("newGuess", { newGuess: { ...savedGuess.toObject(), roundId: existingGag.round._id } });
            return savedGuess;
          }
          throw new UserInputError("No such gag.");

        } catch (error) {
          console.error("Error creating the guess:", error)
          throw new Error("Failed to create that guess.")
        }
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
        ),
        resolve: async (payload) => {
          console.log("trying to return game stage change results");
          const id = payload.gameStageChange._id.toString();
          try {
            let queryId;
            if (mongoose.Types.ObjectId.isValid(id)) {
              queryId = new mongoose.Types.ObjectId(id);
            } else {
              queryId = id;
            }
            const gameWithDetails = await Game.aggregate([
              { $match: { _id: queryId } },
              { 
                $lookup: {
                  from: "players",
                  localField: "_id",
                  foreignField: "game",
                  pipeline: [
                    { $sort: { 'createdAt': 1 } }
                  ],
                  as: "players"
                }
              },
              { 
                $lookup: {
                  from: "rounds",
                  let: { gameId: "$_id" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$game", "$$gameId"] } } },
                    {
                      $lookup: {
                        from: "gags",
                        localField: "_id",
                        foreignField: "round",
                        as: "gags",
                      },
                    },
                    {
                      $lookup: {
                        from: "likes",
                        localField: "_id",
                        foreignField: "round",
                        as: "likes",
                      },
                    },
                    {
                      $lookup: {
                        from: "guesses",
                        let: { roundId: "$_id" },
                        pipeline: [
                          { $sort: { 'createdAt': -1 } },
                          { 
                            $match: { 
                              $expr: { $eq: ["$round", "$$roundId"] } 
                            } 
                          },
                          {
                            $lookup: {
                              from: "players",
                              localField: "guesser",
                              foreignField: "_id",
                              as: "guesser"
                            }
                          },
                          { 
                            $unwind: { 
                              path: "$guesser", 
                              preserveNullAndEmptyArrays: true 
                            } 
                          },
                          {
                            $lookup: {
                              from: "players",
                              localField: "guessed",
                              foreignField: "_id",
                              as: "guessed"
                            }
                          },
                          { 
                            $unwind: { 
                              path: "$guessed", 
                              preserveNullAndEmptyArrays: true 
                            } 
                          }
                        ],
                        as: "guesses"
                      }
                    },
                  ],
                  as: "rounds"
                }
              },
              { 
                $lookup: {
                  from: "rounds",
                  localField: "currentRound",
                  foreignField: "_id",
                  as: "currentRound"
                }
              },
              { 
                $unwind: { 
                  path: "$currentRound", 
                  preserveNullAndEmptyArrays: true 
                } 
              },
              { 
                $lookup: {
                  from: "gags",
                  localField: "currentRound._id",
                  foreignField: "round",
                  as: "currentRound.gags"
                }
              },
              { 
                $lookup: {
                  from: "likes",
                  localField: "currentRound._id",
                  foreignField: "round",
                  as: "currentRound.likes"
                }
              },
              { 
                $lookup: {
                  from: "guesses",
                  let: { roundId: "$currentRound._id" },
                  pipeline: [
                    { $sort: { 'createdAt': -1 } },
                    { 
                      $match: { 
                        $expr: { $eq: ["$round", "$$roundId"] } 
                      }
                    },
                    {
                      $lookup: {
                        from: "players",
                        localField: "guesser",
                        foreignField: "_id",
                        as: "guesser"
                      }
                    },
                    { 
                      $unwind: { 
                        path: "$guesser", 
                        preserveNullAndEmptyArrays: true 
                      } 
                    },
                    {
                      $lookup: {
                        from: "players",
                        localField: "guessed",
                        foreignField: "_id",
                        as: "guessed"
                      }
                    },
                    { 
                      $unwind: { 
                        path: "$guessed", 
                        preserveNullAndEmptyArrays: true 
                      } 
                    }
                  ],
                  as: "currentRound.guesses"
                }
              },
            ]);
          
            if (!gameWithDetails.length) {
              throw new Error("Game not found");
            }
          
            const gameResult = gameWithDetails[0];
            if (!gameResult.currentRound._id) {
              delete gameResult.currentRound;
            }
            return gameResult;
          } catch (error) {
            console.error("Error fetching game", error);
            throw new Error("Failed to fetch game");
          }
        }
      },
      newRound: {
        subscribe: withFilter(
          () => pubsub.asyncIterableIterator('newRound'),
          (payload, variables) => {
            return payload.newRound.gameId.toString() === variables.gameId.toString();
          }
        ),
        resolve: async (payload) => {
          console.log("NEW ROUND SUB ROUND", payload.newRound);
          return payload.newRound;
        }
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
            console.log("trying to resolve gag update subscription")
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