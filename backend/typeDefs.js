const typeDefs = `
  type Query {
    prompts: [Prompt]
    getRandomPrompts: [Prompt]
    getPlayers(gameId: ID!): [Player]
    getPlayer(id: ID!): Player
    getGame(id: ID!): Game
    getCurrentRound(gameId: ID!): Round
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
    stage: Int!
    promptText: String!
    createdAt: Float!
    game: Game
    turn: Int!
    gags: [Gag]
    guesses: [Guess]
  }

  type Player {
    _id: ID!
    points: Int!
    name: String!
    active: Boolean!
    color: String
    createdAt: Float!
    icon: Int
    turn: Int!
    game: Game
    gags: [Gag]
    guessesMade: [Guess]
    guessesReceived: [Guess]
  }

  type Game {
    _id: ID!
    stage: Int!
    gameCode: String!
    active: Boolean!
    createdAt: Float!
    currentRound: Round
    rounds: [Round]
    players: [Player]
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
    createPlayer(name: String!, gameCode: String!): Player!
    updatePlayer(id: ID!, name: String, points: Int, color: String, icon: String): Player!
    createGame: Game!
    updateGameStage(id: ID!, active: Boolean, stage: Int): Game!
    deleteOld: DeleteResponse
    createRound(gameId: ID!, promptText: String!, turn: Int!): Round!
    updateRound(id: ID!, turn: Int, stage: Int): Round!
    createGag(roundId: ID!, playerId: ID!, text: String!): Gag!
    updateGag(id: ID!, guesserId: ID!, guessed: Boolean): Gag!
    updateVote(id: ID!): Gag!
    createGuess(gagId: ID!, guesserId: ID!, guessedId: ID!): Guess!
    createPrompt(text: String!): Prompt!
  }

  type Subscription {
    newPlayer(gameId: ID!): [Player]
    playerChange(gameId: ID!): Player
    newGuess(roundId: ID!): [Guess]
    gagUpdate(roundId: ID!): [Gag]
    gagChange(roundId: ID!): Gag
    voteChange(roundId: ID!): Gag
    newRound(gameId: ID!): Round
    roundChange(gameId: ID!): Round
    gameStageChange(gameId: ID!): Game
  }
`;

export default typeDefs;