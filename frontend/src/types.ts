export interface Prompt {
    _id: string;
    promptId?: number;
    text: string;
  }
  
  export interface Gag {
    _id: string;
    guessed: boolean;
    text: string;
    createdAt: number; // Float in GraphQL -> number in TS
    player: Player;
    guesser?: Player;
    round: Round;
    votes: number;
    guesses: Guess[];
  }
  
  export interface Round {
    _id: string;
    stage: number;
    promptText: string;
    createdAt: number;
    game: Game;
    turn: number;
    gags: Gag[];
    guesses: Guess[];
    likes: Like[];
  }
  
  export interface Player {
    _id: string;
    points: number;
    name: string;
    active: boolean;
    color?: string;
    createdAt: number;
    icon?: number;
    turn: number;
    game: Game;
    gags: Gag[];
    guessesMade: Guess[];
    guessesReceived: Guess[];
    likesGiven: [Like];
    likesReceived: [Like];
  }
  
  export interface Game {
    _id: string;
    stage: number;
    gameCode: string;
    active: boolean;
    createdAt: number;
    currentRound: Round;
    rounds: Round[];
    players: Player[];
  }
  
  export interface Guess {
    _id: string;
    isCorrect: boolean;
    createdAt: number;
    guesser: Player;
    guessed: Player;
    gag: Gag;
  }  

  export interface Like {
    _id: string;
    round: Round;
    player: Player;
    gag: Gag;
  }
  
  export interface DeleteResponse {
    deletedGameCount: number;
    deletedRoundCount: number;
    deletedPlayerCount: number;
    deletedGagCount: number;
    deletedGuessCount: number;
  }
  
  // Query and Mutation Types
  export interface QueryResolvers {
    prompts: () => Promise<Prompt[]>;
    getRandomPrompts: () => Promise<Prompt[]>;
    getGags: (args: { id?: string; roundId?: string; guesserId?: string; playerId?: string; guessed?: boolean }) => Promise<Gag[]>;
    rounds: () => Promise<Round[]>;
    players: () => Promise<Player[]>;
    game: (args: { gameCode: string }) => Promise<Game | null>;
    guesses: () => Promise<Guess[]>;
    getPromptsByColors: (args: { colors: string[] }) => Promise<Prompt[]>;
  }
  
  export interface MutationResolvers {
    createPlayer: (args: { name: string; gameCode: string; color?: string; icon?: string }) => Promise<Player>;
    updatePlayer: (args: { id: string; name?: string; points?: number; color?: string; icon?: string }) => Promise<Player>;
    createGame: () => Promise<Game>;
    updateGame: (args: { id: string; active?: boolean }) => Promise<Game>;
    deleteOld: () => Promise<DeleteResponse>;
    createRound: (args: { gameId: string; promptText: string; turn: number }) => Promise<Round>;
    updateRound: (args: { id: string; turn?: number; stage?: number }) => Promise<Round>;
    createGag: (args: { roundId: string; playerId: string; text: string }) => Promise<Gag>;
    updateGag: (args: { id: string; guesserId?: string; guessed?: boolean }) => Promise<Gag>;
    updateVote: (args: { id: string }) => Promise<Gag>;
    createGuess: (args: { guesserId: string; guessedId: string; gagId: string }) => Promise<Guess>;
    createPrompt: (args: { text: string }) => Promise<Prompt>;
  }
  
  export interface SubscriptionResolvers {
    newPlayer: (args: { gameId: string }) => AsyncIterator<Player[]>;
    playerChange: (args: { gameId: string }) => AsyncIterator<Player>;
    newGuess: (args: { gameId: string }) => AsyncIterator<Guess>;
    newGag: (args: { roundId: string }) => AsyncIterator<Gag>;
    gagChange: (args: { roundId: string }) => AsyncIterator<Gag>;
    voteChange: (args: { roundId: string }) => AsyncIterator<Gag>;
    newRound: (args: { gameId: string }) => AsyncIterator<Round>;
    roundChange: (args: { gameId: string }) => AsyncIterator<Round>;
    gameStageChange: (args: { gameId: string }) => AsyncIterator<Game>;
  }

  export interface Avatar {
      name: string;
      neutral: string;
      happy: string;
      suspicious: string;
      nervous: string;
      sad: string;
      sad_phrase: string;
      happy_phrase: string;
  }

  export type Emotion = 'neutral' | 'happy' | 'suspicious' | 'nervous' | 'sad';