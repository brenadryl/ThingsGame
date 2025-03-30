import { create } from 'zustand';
import { Gag, Game, Guess, Like, Player, Room, Round } from '../types';

export interface GameState {
    game: Game | null;
    gagList: Gag[];
    likes: Like[];
    guessList: Guess[];
    playerList: Player[];
    currentTurnPlayer: Player | null;
    newGuess: Guess | null;
    myTurn: boolean;
    room: Room | null;
    currentRound: Round | null;

    setGame: (game: Game | null) => void;
    setPlayerList: (players: Player[]) => void;
    setGagList: (gags: Gag[]) => void;
    setLikes: (likes: Like[]) => void;
    setGuessList: (guesses: Guess[]) => void;
    setCurrentTurnPlayer: (player: Player | null) => void;
    setNewGuess: (guess: Guess | null) => void;
    setMyTurn: (val: boolean) => void;
    setRoom: (val: Room | null) => void;
    setCurrentRound: (val: Round | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
    game: null,
    gagList: [],
    likes: [],
    guessList: [],
    playerList: [],
    oldGuessIds: [],
    currentTurnPlayer: null,
    newGuess: null,
    myTurn: false,
    room: null,
    currentRound: null,

    setGame: (game) => set({ game }),
    setPlayerList: (playerList) => set({ playerList }),
    setGagList: (gagList) => set({ gagList }),
    setLikes: (likes) => set({ likes }),
    setGuessList: (guessList) => set({ guessList }),
    setCurrentTurnPlayer: (currentTurnPlayer) => set({ currentTurnPlayer }),
    setNewGuess: (newGuess) => set({ newGuess }),
    setMyTurn: (myTurn) => set({ myTurn }),
    setRoom: (room) => set({room}),
    setCurrentRound: (currentRound) => set({currentRound}),
}));