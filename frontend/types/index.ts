//types/index.ts
// Example: types/index.ts
export interface UserPrediction {
  team1: number;
  team2: number;
  winner?: 'team1' | 'team2' | null;
}


  

export interface KnockoutMatch {
    id: string;
    team1: string;
    team2: string;
    userPrediction: UserPrediction;
  }
  
  export interface Team {
    name: string;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
  }
  
  export interface Group {
    name: string;
    teams: Team[];
  }
  
  export interface GroupWinners {
    [key: string]: {
      winner: string;
      runnerUp: string;
    };
  }
  
  export interface Player {
    id: string;
    name: string;
  }

export interface Prediction {
  match_id: string;
  round: string;
  userPrediction: UserPrediction;
}


export interface Guess {
  match_id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  group: string;
  userPrediction: UserPrediction;
}