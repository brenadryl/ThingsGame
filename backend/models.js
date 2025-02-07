import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
    promptId: { type: Number  },
    text: { type: String, required: true, unique: true },
});

const gagSchema = new mongoose.Schema({
    guessed: { type: Boolean, default: false },
    text: { type: String, required: true },
    votes: { type: Number, default: 0},
    createdAt: { type: Date, default: Date.now },
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Player'
    },
    guesserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    roundId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Round'
    },
});

const roundSchema = new mongoose.Schema({
    roundNumber: { type: Number, required: true },
    stage: { type: Number, max: 2, default: 1 },
    promptText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    turn: { type: Number, required: true },
});

const playerSchema = new mongoose.Schema({
    points: { type: Number, default: 0},
    active: { type: Boolean, default: true },
    name: { type: String, required: true },
    color: { type: String},
    icon: { type: String},
    createdAt: { type: Date, default: Date.now },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
});

const gameSchema = new mongoose.Schema({
    active: { type: Boolean, default: false },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    currentRoundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Round'
    },
});

const guessSchema = new mongoose.Schema({
    isCorrect: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
    guesserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    guessedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    gagId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gag'
    },
});

export const Prompt = mongoose.model('Prompt', promptSchema);
export const Player = mongoose.model('Player', playerSchema);
export const Round = mongoose.model('Round', roundSchema);
export const Game = mongoose.model('Game', gameSchema);
export const Gag = mongoose.model('Gag', gagSchema);
export const Guess = mongoose.model('Guess', guessSchema);