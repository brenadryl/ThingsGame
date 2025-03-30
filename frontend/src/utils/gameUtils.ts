import { Player, Guess, Gag, Game } from "../types";

export const getCurrentTurn = (
  playerList: Player[] | undefined,
  lastWrongGuess: Guess | undefined,
  turn: number,
  gagList: Gag[] | undefined
) => {
  if (!playerList) return null;
  const firstPlayerGag = gagList?.find((gag) => gag.player._id === playerList[turn]._id);
  if (!gagList?.find(gag => !gag.guessed)) {
    return null;
  }
  if (!lastWrongGuess && !firstPlayerGag?.guessed) {
    return playerList[turn] || null;
  }
  const lastWrongGuesserId = lastWrongGuess?.guesser?._id || playerList[turn]._id || '';
  console.log("lastWrongGuesser", playerList.find(p => p._id ===lastWrongGuesserId))

  let currentPlayerIndex = playerList.findIndex((player) => player._id === lastWrongGuesserId);
  if (currentPlayerIndex === -1) return playerList[turn] || null;

  while (true) {
    currentPlayerIndex = (currentPlayerIndex + 1) % playerList.length;
    const playerItr = currentPlayerIndex;
    const currentGag = gagList?.find((gag) => gag.player._id === playerList[playerItr]._id);
    if (!gagList || (!!currentGag && !currentGag.guessed)) {
      return playerList[currentPlayerIndex];
    }
  }
};

export const sortGags = (gags: Gag[]) => [...gags].sort((a, b) => a.text.localeCompare(b.text));

export const shallowEqual = (arr1: any[], arr2: any[]) => {
  if (arr1 === arr2) return true;
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
}


function getEarliestAndLatestGagCreators(players: Player[]) {
  if (!players || players.length === 0) return { earliest: null, latest: null };

  const calculateAverageCreatedAt = (gags: Gag[]) => {
    if (gags.length === 0) return Infinity; // No gags means we can't calculate an average
    return gags.reduce((sum, gag) => sum + gag.createdAt, 0) / gags.length;
  };

  let earliestPlayer: Player | null = null;
  let latestPlayer: Player | null = null;
  let earliestTime = Infinity;
  let latestTime = -Infinity;

  for (const player of players) {
    const avgCreatedAt = calculateAverageCreatedAt(player.gags);
    console.log("player.gags", player.gags)
    console.log("avgCreatedAt", avgCreatedAt)
    
    if (avgCreatedAt < earliestTime) {
      earliestTime = avgCreatedAt;
      earliestPlayer = player;
    }

    if (avgCreatedAt > latestTime) {
      latestTime = avgCreatedAt;
      latestPlayer = player;
    }
  }

  return { earliest: earliestPlayer, latest: latestPlayer };
}



export const getSuperlatives = (players: Player[]) => {
    let superlatives = {
        mostLiked: "",
        liker: "",
        mostSus: "",
        easyOut:"",
        probablyBot: "", // least liked
        sniper: "",
        selfLike: "",
        tldr: "", //rambler
        minimalist: "", //one word wonder
        conspiracyTheorist: "",
        quickest: "",
        slowest: "",
    }

    console.log("players", players)

    if (players && players.length > 0) {
        const getTotalLikesReceived = (player: Player) => player.likesReceived.length;
        const getTotalLikesGiven = (player: Player) => player.likesGiven.filter((like) => like.gag.player._id !== player._id).length;
        const getIncorrectGuessesReceived = (player: Player) => player.guessesReceived.filter((guess) => !guess.isCorrect).length;
        const getCorrectGuessesMade = (player: Player) => player.guessesMade.filter((guess) => guess.isCorrect).length;
        const getIncorrectGuessesMade = (player: Player) => player.guessesMade.filter((guess) => !guess.isCorrect).length;
        const getSelfLikes = (player: Player) => player.likesGiven.filter((like) => like.gag.player._id === player._id).length;
        const getTotalGagTextLength = (player: Player) => player.gags.reduce((sum, gag) => sum + (gag.text?.length || 0), 0);
          
        // Helper function to check if there's a unique max/min value
        const hasUniqueMax = (players: Player[], metric: (p: Player) => number) => {
            const maxValue = Math.max(...players.map(metric));
            return players.filter((p) => metric(p) === maxValue).length === 1;
        };
        
        const hasUniqueMin = (players: Player[], metric: (p: Player) => number) => {
            const minValue = Math.min(...players.map(metric));
            return players.filter((p) => metric(p) === minValue).length === 1;
        };
        
        // Superlative Calculations
        const mostLiked = hasUniqueMax(players, getTotalLikesReceived)
            ? players.reduce((max, p) => (getTotalLikesReceived(p) > getTotalLikesReceived(max) ? p : max), players[0])
            : null;
        
        const liker = hasUniqueMax(players, getTotalLikesGiven)
            ? players.reduce((max, p) => (getTotalLikesGiven(p) > getTotalLikesGiven(max) ? p : max), players[0])
            : null;
        
        const mostSus = hasUniqueMax(players, getIncorrectGuessesReceived)
            ? players.reduce((max, p) => (getIncorrectGuessesReceived(p) > getIncorrectGuessesReceived(max) ? p : max), players[0])
            : null;
        
        const easyOut = hasUniqueMin(players, getIncorrectGuessesReceived)
            ? players.reduce((min, p) =>
                (getIncorrectGuessesReceived(p) < getIncorrectGuessesReceived(min) || 
                (getIncorrectGuessesReceived(p) === getIncorrectGuessesReceived(min) && p.guessesMade.length < min.guessesMade.length))
                ? p
                : min, players[0])
            : null;
        
        const sniper = hasUniqueMax(players, getCorrectGuessesMade)
            ? players.reduce((max, p) => (getCorrectGuessesMade(p) > getCorrectGuessesMade(max) ? p : max), players[0])
            : null;

        const conspiracyTheorist = hasUniqueMax(players, getIncorrectGuessesMade)
            ? players.reduce((max, p) => (getIncorrectGuessesMade(p) > getIncorrectGuessesMade(max) ? p : max), players[0])
            : null;
        
        const leastLiked = hasUniqueMin(players, getTotalLikesReceived)
            ? players.reduce((min, p) => (getTotalLikesReceived(p) < getTotalLikesReceived(min) ? p : min), players[0])
            : null;
        
        const minimalist = hasUniqueMin(players, getTotalGagTextLength)
            ? players.reduce((min, p) => (getTotalGagTextLength(p) < getTotalGagTextLength(min) ? p : min), players[0])
            : null;
        
        const rambler = hasUniqueMax(players, getTotalGagTextLength)
            ? players.reduce((max, p) => (getTotalGagTextLength(p) > getTotalGagTextLength(max) ? p : max), players[0])
            : null;
        
        const selfLike = hasUniqueMax(players, getSelfLikes)
            ? players.reduce((max, p) => (getSelfLikes(p) > getSelfLikes(max) ? p : max), players[0])
            : null;

            const { earliest, latest } = getEarliestAndLatestGagCreators(players);

        superlatives = {
            mostLiked: mostLiked?._id || "",
            liker: liker?._id || "",
            mostSus: mostSus?._id || "",
            easyOut: easyOut?._id || "",
            probablyBot: leastLiked?._id || "", // least liked
            sniper: sniper?._id || "",
            selfLike: selfLike?._id || "",
            tldr: rambler?._id || "", //rambler
            minimalist: minimalist?._id || "", //one word wonder\
            conspiracyTheorist: conspiracyTheorist?._id || "",
            quickest: earliest?._id || "",
            slowest: latest?._id || "",
        }

    }
    return superlatives;
}

export const getFavoriteGags = (game: Game | null) => {
  if (!game) return { totalLikeCounts: null, favoriteGags: null};
  const totalLikeCounts: Record<string, number> = {};
  const faves = game.rounds.map((round) => {
    if (!round.likes || round.likes.length === 0) return null;
    const likeCounts: Record<string, number> = {};
    for (const like of round.likes) {
        likeCounts[like.gag._id] = (likeCounts[like.gag._id] || 0) + 1;
        totalLikeCounts[like.gag._id] = (totalLikeCounts[like.gag._id] || 0) + 1;
    }
    
    let mostLikedGagId: string | null = null;
    let maxLikes = 0;
    let hasTie = false;
    for (const [gagId, count] of Object.entries(likeCounts)) {
        if (count > maxLikes) {
            mostLikedGagId = gagId;
            maxLikes = count;
            hasTie = false; // Reset tie flag when a new max is found
        } else if (count === maxLikes) {
            hasTie = true;
        }
    }
    let foundGag = round.gags.find((gag) => gag._id === mostLikedGagId);
    
    return hasTie || !foundGag ? null : foundGag
  })
  console.log("faves", faves)
  return {
    totalLikeCounts,
    favoriteGags: faves
  }
}

export const calculatePoints = (game: Game | null, favoriteGags: (Gag | null)[], players: Player[]) => {
  if (!game) return [];

  const playerPoints = players.map((player) => {
    const totalCorrectGuesses = game.rounds.reduce((acc, round) => {
      const correctGuesses = (round.guesses ?? []).filter(
        (guess) => guess.isCorrect && guess.guesser._id === player._id
      ).length;
      return acc + correctGuesses;
    }, 0);
    const favoriteCount = favoriteGags ? favoriteGags.filter(gag => gag?.player._id === player._id).length : 0;

    return {
      playerId: player._id,
      points: totalCorrectGuesses + favoriteCount,
    };
  })
  return playerPoints.sort((a, b) => b.points - a.points);
}