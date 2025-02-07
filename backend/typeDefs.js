const typeDefs = `
  type Query {
    prompts: [Prompt]
    getRandomPrompts: [Prompt]
    getGags(id: ID, roundId: ID, guesserId: ID, playerId: ID, guessed: Boolean): [Gag],
    rounds: [Round]
    players: [Player]
    game(gameCode: String): Game
    guesses: [Guess]
    getPromptsByColors(colors: [String!]!): [Prompt]
  }

  type Prompt {
    _id: ID!
    promptId: Int
    text: String!
  }

  type Gag {
    _id: ID!
    guessed: Boolean!
    text: String!
    createdAt: Float!
    player: Player
    guesser: Player
    round: Round
    votes: Int!
    guesses: [Guess]
  }

  type Round {
    _id: ID!
    roundNumber: Int!
    stage: Int!
    finished: Boolean!
    promptText: String!
    createdAt: Float!
    game: Game
    turn: Int!
    gags: [Gag]
  }

  type Player {
    _id: ID!
    points: Int!
    name: String!
    active: Boolean!
    color: String
    createdAt: Float!
    icon: String
    game: Game
    guessesMade: [Guess]
    guessesReceived: [Guess]
  }

  type Game {
    _id: ID!
    stage: Int!
    finished: Boolean!
    createdAt: Float!
    currentRound: Round
    host: Player
    rounds: [Round]
    players: [Player]
    guesses: [Guess]
  }

  type Guess {
    _id: ID!
    isCorrect: Boolean!
    createdAt: Float!
    guesser: Player
    guessed: Player
    gag: Gag
  }

  type DeleteResponse {
    deletedGameCount: Int
    deletedRoundCount: Int
    deletedPlayerCount: Int
    deletedGagCount: Int
    deletedGuessCount: Int
  }

  type Mutation {
    createPlayer(name: String!, gameCode: String!, color: String, icon: String): Player!
    updatePlayer(id: ID!, name: String, points: Int, color: String, icon: String): Player!
    createGame: Game!
    updateGame(id: ID!, active: Boolean): Game!
    deleteOld: DeleteResponse
    createRound(gameId: ID!, roundNumber: Int!, promptText: String!, turn: Int!): Round!
    updateRound(id: ID!, turn: Int, stage: Int): Round!
    createGag(roundId: ID!, playerId: ID!, text: String!): Gag!
    updateGag(id: ID!, guesserId: ID!, guessed: Boolean): Gag!
    updateVote(id: ID!): Gag!
    createGuess(guesserId: ID!, guessedId: ID!, gagId: ID!): Guess!
    createPrompt(text: String!): Prompt!
  }

  type Subscription {
    newPlayer(gameId: ID!): Player
    playerChange(gameId: ID!): Player
    newGuess(gameId: ID!): Guess
    newGag(roundId: ID!): Gag
    gagChange(roundId: ID!): Gag
    voteChange(roundId: ID!): Gag
    newRound(gameId: ID!): Round
    roundChange(gameId: ID!): Round
    gameChange(gameId: ID!): Game
  }
`;

export default typeDefs;