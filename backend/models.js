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
    player: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Player'
    },
    guesser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    round: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Round'
    },
});

const likeSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    round: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Round'
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    gag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gag'
    },
});

const roundSchema = new mongoose.Schema({
    stage: { type: Number, max: 2, default: 1 },
    promptText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    game: {
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
    icon: { type: Number, required: true },
    turn: { type: Number, required: true},
    createdAt: { type: Date, default: Date.now },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
});

playerSchema.index({ game: 1, icon: 1 }, { unique: true });

const gameSchema = new mongoose.Schema({
    active: { type: Boolean, default: true },
    gameCode: { type: String, required: true },
    stage: { type: Number, max: 3, default: 1 },
    minutes: { type: Number, max: 5, default: 5 },
    mode: {type: String, default: "easy"},
    createdAt: { type: Date, default: Date.now },
    currentRound: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Round'
    },
});

const guessSchema = new mongoose.Schema({
    isCorrect: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
    guesser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    guessed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    gag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gag'
    },
    round: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Round'
    },
});

export const Prompt = mongoose.model('Prompt', promptSchema);
export const Player = mongoose.model('Player', playerSchema);
export const Round = mongoose.model('Round', roundSchema);
export const Game = mongoose.model('Game', gameSchema);
export const Gag = mongoose.model('Gag', gagSchema);
export const Guess = mongoose.model('Guess', guessSchema);
export const Like = mongoose.model('Like', likeSchema);