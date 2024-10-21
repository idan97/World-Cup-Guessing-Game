// hooks/usePredictions.ts
import { useState, useEffect } from 'react';

interface UserPrediction {
  team1: number;
  team2: number;
  winner?: 'team1' | 'team2';
}

interface Guess {
  match_id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  group: string;
  userPrediction: UserPrediction;
}

interface Team {
  name: string;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface Group {
  name: string;
  teams: Team[];
}

interface GroupWinners {
  [key: string]: {
    winner: string;
    runnerUp: string;
  };
}

interface KnockoutMatch {
  id: string;
  team1: string;
  team2: string;
  userPrediction: UserPrediction;
}

// Initial Knockout Matches Data
const initialKnockoutMatchesData = {
    roundOf16: [
      { id: '1', team1: 'Winner Group A', team2: 'Runner-up Group B', userPrediction: { team1: 0, team2: 0 } },
      { id: '2', team1: 'Winner Group C', team2: 'Runner-up Group D', userPrediction: { team1: 0, team2: 0 } },
      { id: '3', team1: 'Winner Group E', team2: 'Runner-up Group F', userPrediction: { team1: 0, team2: 0 } },
      { id: '4', team1: 'Winner Group G', team2: 'Runner-up Group H', userPrediction: { team1: 0, team2: 0 } },
      { id: '5', team1: 'Winner Group B', team2: 'Runner-up Group A', userPrediction: { team1: 0, team2: 0 } },
      { id: '6', team1: 'Winner Group D', team2: 'Runner-up Group C', userPrediction: { team1: 0, team2: 0 } },
      { id: '7', team1: 'Winner Group F', team2: 'Runner-up Group E', userPrediction: { team1: 0, team2: 0 } },
      { id: '8', team1: 'Winner Group H', team2: 'Runner-up Group G', userPrediction: { team1: 0, team2: 0 } },
    ],
    quarterFinals: [
      { id: '9', team1: '', team2: '', userPrediction: { team1: 0, team2: 0 } },
      { id: '10', team1: '', team2: '', userPrediction: { team1: 0, team2: 0 } },
      { id: '11', team1: '', team2: '', userPrediction: { team1: 0, team2: 0 } },
      { id: '12', team1: '', team2: '', userPrediction: { team1: 0, team2: 0 } },
    ],
    semiFinals: [
      { id: '13', team1: '', team2: '', userPrediction: { team1: 0, team2: 0 } },
      { id: '14', team1: '', team2: '', userPrediction: { team1: 0, team2: 0 } },
    ],
    final: { id: '15', team1: '', team2: '', userPrediction: { team1: 0, team2: 0 } },
  };

export const usePredictions = (token: string | null, isAuthenticated: boolean) => {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [standings, setStandings] = useState<Group[]>([]);
  const [groupWinners, setGroupWinners] = useState<GroupWinners>({});
  const [knockoutMatches, setKnockoutMatches] = useState(initialKnockoutMatchesData);
  const [loadingGuesses, setLoadingGuesses] = useState<boolean>(true);
  const [errorGuesses, setErrorGuesses] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchGuesses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/guesses/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setGuesses(data);
        updateGroupStandings(data);
      } catch (error: any) {
        setErrorGuesses(error.message || 'Failed to fetch guesses.');
        setGuesses([]);
      } finally {
        setLoadingGuesses(false);
      }
    };

    fetchGuesses();
  }, [isAuthenticated, token]);

  // Update group standings logic
  const updateGroupStandings = (updatedGuesses: Guess[]) => {
    const groupMap: { [groupName: string]: { [teamName: string]: Team } } = {};

    updatedGuesses.forEach(guess => {
      const { group, homeTeam, awayTeam, userPrediction } = guess;
      if (!groupMap[group]) groupMap[group] = {};

      if (!groupMap[group][homeTeam]) groupMap[group][homeTeam] = { name: homeTeam, points: 0, goalsFor: 0, goalsAgainst: 0 };
      if (!groupMap[group][awayTeam]) groupMap[group][awayTeam] = { name: awayTeam, points: 0, goalsFor: 0, goalsAgainst: 0 };

      const homeTeamObj = groupMap[group][homeTeam];
      const awayTeamObj = groupMap[group][awayTeam];

      homeTeamObj.goalsFor += userPrediction.team1;
      homeTeamObj.goalsAgainst += userPrediction.team2;
      awayTeamObj.goalsFor += userPrediction.team2;
      awayTeamObj.goalsAgainst += userPrediction.team1;

      if (userPrediction.team1 > userPrediction.team2) homeTeamObj.points += 3;
      else if (userPrediction.team1 < userPrediction.team2) awayTeamObj.points += 3;
      else {
        homeTeamObj.points += 1;
        awayTeamObj.points += 1;
      }
    });

    const groupsArray: Group[] = Object.keys(groupMap).map(groupName => ({
      name: groupName,
      teams: Object.values(groupMap[groupName]),
    }));

    groupsArray.forEach(group => group.teams.sort((a, b) => {
      const goalDiffA = a.goalsFor - a.goalsAgainst;
      const goalDiffB = b.goalsFor - b.goalsAgainst;
      return b.points - a.points || goalDiffB - goalDiffA || b.goalsFor - a.goalsFor || a.name.localeCompare(b.name);
    }));

    setStandings(groupsArray);

    const newGroupWinners: GroupWinners = {};
    groupsArray.forEach(group => {
      if (group.teams.length >= 2) {
        newGroupWinners[group.name] = { winner: group.teams[0].name, runnerUp: group.teams[1].name };
      }
    });
    setGroupWinners(newGroupWinners);
  };

  // Submitting predictions logic
  const handleSubmitPredictions = async () => {
    if (!token) return;
    try {
      const payload = guesses.map((guess) => ({
        match_id: guess.match_id,
        userPrediction: guess.userPrediction,
      }));

      const response = await fetch('http://127.0.0.1:8000/guesses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to submit predictions: ${response.statusText}`);
    } catch (error: any) {
      console.error('Error submitting predictions:', error);
    }
  };

  return {
    guesses,
    standings,
    groupWinners,
    knockoutMatches,
    loadingGuesses,
    errorGuesses,
    handleSubmitPredictions,
    setGuesses,
    updateGroupStandings,
  };
};
