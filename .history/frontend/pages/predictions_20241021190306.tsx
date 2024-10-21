// frontend/pages/predictions.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import KnockoutBracket from '@/components/ui/knockoutBracket'; // Updated casing
import GroupStageMatches from '@/components/ui/GroupStageMatches';
import GroupStandings from '@/components/ui/GroupStandings';
import TopGoalScorer from '@/components/ui/TopGoalScorer';

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

interface KnockoutMatch {
  id: string;
  team1: string;
  team2: string;
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

interface Player {
  id: string;
  name: string;
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

const PredictionsPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [standings, setStandings] = useState<Group[]>([]);
  const [groupWinners, setGroupWinners] = useState<GroupWinners>({});
  const [knockoutMatches, setKnockoutMatches] = useState(initialKnockoutMatchesData);
  const [matchSortCriteria, setMatchSortCriteria] = useState<'date' | 'group'>('date');
  const [loadingGuesses, setLoadingGuesses] = useState<boolean>(true);
  const [errorGuesses, setErrorGuesses] = useState<string | null>(null);

  // State for Top Goal Scorer
  const [selectedTopGoalScorer, setSelectedTopGoalScorer] = useState<Player | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);
  const [errorPlayers, setErrorPlayers] = useState<string | null>(null);

  // Static List of Players for Testing
  const players: Player[] = [
    { id: '1', name: 'Lionel Messi' },
    { id: '2', name: 'Cristiano Ronaldo' },
    { id: '3', name: 'Kylian Mbappé' },
    { id: '4', name: 'Neymar Jr.' },
    { id: '5', name: 'Harry Kane' },
    { id: '6', name: 'Robert Lewandowski' },
    { id: '7', name: 'Erling Haaland' },
    { id: '8', name: 'Mohamed Salah' },
    { id: '9', name: 'Sadio Mané' },
    { id: '10', name: 'Kevin De Bruyne' },
    // Add more players as needed for testing
  ];

  // Check authentication
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (!storedToken) {
      router.push('/');
    } else {
      setToken(storedToken);
      setUsername(storedUsername);
      setIsAuthenticated(true);
    }
  }, [router]);

  // Fetch user guesses from the backend
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchGuesses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/guesses/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched guesses:', data);

        setGuesses(data);
        updateGroupStandings(data);
      } catch (error: any) {
        console.error('Error fetching guesses:', error);
        setErrorGuesses(error.message || 'Failed to fetch guesses.');
        setGuesses([]);
      } finally {
        setLoadingGuesses(false);
      }
    };

    fetchGuesses();
  }, [isAuthenticated, token]);

  // Handle submission of guesses
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

      if (!response.ok) {
        throw new Error(`Failed to submit predictions: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Predictions submitted successfully:', result);
    } catch (error: any) {
      console.error('Error submitting predictions:', error);
    }
  };

  // Handle input changes for guesses
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    matchId: string,
    team: 'team1' | 'team2'
  ) => {
    let value = e.target.value.replace(/^0+/, '');
    if (value === '') value = '0';
    handlePredictionChange(matchId, team, Number(value));
  };

  // Handle changes in user guesses
  const handlePredictionChange = (matchId: string, team: 'team1' | 'team2', score: number) => {
    if (score < 0) score = 0;

    const updatedGuesses = guesses.map((guess) =>
      guess.match_id === matchId
        ? {
            ...guess,
            userPrediction: {
              ...guess.userPrediction,
              [team]: score,
            },
          }
        : guess
    );

    setGuesses(updatedGuesses);
    updateGroupStandings(updatedGuesses);
  };

  const updateGroupStandings = (updatedGuesses: Guess[]) => {
    const groupMap: { [groupName: string]: { [teamName: string]: Team } } = {};
  
    // Calculate points and goals for each team
    updatedGuesses.forEach((guess) => {
      const groupName = guess.group;
      if (!groupMap[groupName]) {
        groupMap[groupName] = {};
      }
  
      const homeTeamName = guess.homeTeam;
      const awayTeamName = guess.awayTeam;
  
      if (!groupMap[groupName][homeTeamName]) {
        groupMap[groupName][homeTeamName] = {
          name: homeTeamName,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        };
      }
      if (!groupMap[groupName][awayTeamName]) {
        groupMap[groupName][awayTeamName] = {
          name: awayTeamName,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        };
      }
    });
  
    // Update points and goals for each match
    updatedGuesses.forEach((guess) => {
      const groupName = guess.group;
      const homeTeam = groupMap[groupName][guess.homeTeam];
      const awayTeam = groupMap[groupName][guess.awayTeam];
      const prediction = guess.userPrediction;
  
      if (homeTeam && awayTeam) {
        homeTeam.goalsFor += prediction.team1;
        homeTeam.goalsAgainst += prediction.team2;
        awayTeam.goalsFor += prediction.team2;
        awayTeam.goalsAgainst += prediction.team1;
  
        if (prediction.team1 > prediction.team2) {
          homeTeam.points += 3;
        } else if (prediction.team1 < prediction.team2) {
          awayTeam.points += 3;
        } else {
          homeTeam.points += 1;
          awayTeam.points += 1;
        }
      }
    });
  
    // Convert groupMap to an array of groups and sort teams
    const groupsArray: Group[] = Object.keys(groupMap).map((groupName) => ({
      name: groupName,
      teams: Object.values(groupMap[groupName]),
    }));
  
    groupsArray.forEach((group) => {
      group.teams.sort((a, b) => {
        const goalDiffA = a.goalsFor - a.goalsAgainst;
        const goalDiffB = b.goalsFor - b.goalsAgainst;
  
        return (
          b.points - a.points ||
          goalDiffB - goalDiffA ||
          b.goalsFor - a.goalsFor ||
          a.name.localeCompare(b.name)
        );
      });
    });
  
    setStandings(groupsArray);
  
    // Determine group winners and runners-up
    const newGroupWinners: GroupWinners = {};
    groupsArray.forEach((group) => {
      if (group.teams.length >= 2) {
        newGroupWinners[group.name] = {
          winner: group.teams[0].name,
          runnerUp: group.teams[1].name,
        };
      }
    });
  
    setGroupWinners(newGroupWinners); // This triggers the knockout matches update
  };
  

  // Update knockout matches when group winners change
useEffect(() => {
  if (Object.keys(groupWinners).length === 0) return; // Ensure group winners are available

  const updatedKnockoutMatches = {
    ...knockoutMatches,
    roundOf16: knockoutMatches.roundOf16.map((match) => {
      let team1 = match.team1;
      let team2 = match.team2;

      // Patterns to match "Winner" or "Runner-up" placeholders
      const winnerGroupPattern = /^Winner Group (.+)$/;
      const runnerUpGroupPattern = /^Runner-up Group (.+)$/;

      // Update team1 based on group winner or runner-up
      const team1MatchWinner = team1.match(winnerGroupPattern);
      const team1MatchRunnerUp = team1.match(runnerUpGroupPattern);
      const team2MatchWinner = team2.match(winnerGroupPattern);
      const team2MatchRunnerUp = team2.match(runnerUpGroupPattern);

      if (team1MatchWinner) {
        const groupName = team1MatchWinner[1];
        team1 = groupWinners[groupName]?.winner || team1;
      } else if (team1MatchRunnerUp) {
        const groupName = team1MatchRunnerUp[1];
        team1 = groupWinners[groupName]?.runnerUp || team1;
      }

      if (team2MatchWinner) {
        const groupName = team2MatchWinner[1];
        team2 = groupWinners[groupName]?.winner || team2;
      } else if (team2MatchRunnerUp) {
        const groupName = team2MatchRunnerUp[1];
        team2 = groupWinners[groupName]?.runnerUp || team2;
      }

      return {
        ...match,
        team1,
        team2,
      };
    }),
  };

  setKnockoutMatches(updatedKnockoutMatches);
}, [groupWinners, knockoutMatches]); // Ensure this runs every time groupWinners change


  // Handle knockout score changes
  const handleKnockoutScoreChange = (
    roundKey: keyof typeof knockoutMatches,
    matchId: string,
    team: 'team1' | 'team2',
    score: number
  ) => {
    if (score < 0) score = 0;

    setKnockoutMatches((prevMatches) => {
      if (roundKey === 'final') {
        const updatedFinal = {
          ...prevMatches.final,
          userPrediction: {
            ...prevMatches.final.userPrediction,
            [team]: score,
            winner: undefined, // Reset winner when score changes
          },
        };
        const updatedMatches = { ...prevMatches, final: updatedFinal };
        updateKnockoutProgression(updatedMatches);
        return updatedMatches;
      } else {
        const updatedRound = (prevMatches[roundKey] as KnockoutMatch[]).map((match) =>
          match.id === matchId
            ? {
                ...match,
                userPrediction: {
                  ...match.userPrediction,
                  [team]: score,
                  winner: undefined, // Reset winner when score changes
                },
              }
            : match
        );
        const updatedMatches = { ...prevMatches, [roundKey]: updatedRound };
        updateKnockoutProgression(updatedMatches);
        return updatedMatches;
      }
    });
  };

  // Handle knockout winner selection
  const handleKnockoutWinnerSelect = (
    roundKey: keyof typeof knockoutMatches,
    matchId: string,
    winner: 'team1' | 'team2'
  ) => {
    setKnockoutMatches((prevMatches) => {
      if (roundKey === 'final') {
        const updatedFinal = {
          ...prevMatches.final,
          userPrediction: {
            ...prevMatches.final.userPrediction,
            winner,
          },
        };
        const updatedMatches = { ...prevMatches, final: updatedFinal };
        updateKnockoutProgression(updatedMatches);
        return updatedMatches;
      } else {
        const updatedRound = (prevMatches[roundKey] as KnockoutMatch[]).map((match) =>
          match.id === matchId
            ? {
                ...match,
                userPrediction: {
                  ...match.userPrediction,
                  winner,
                },
              }
            : match
        );
        const updatedMatches = { ...prevMatches, [roundKey]: updatedRound };
        updateKnockoutProgression(updatedMatches);
        return updatedMatches;
      }
    });
  };

  const matchMappings = {
    quarterFinals: {
      '9': ['1', '2'],
      '10': ['3', '4'],
      '11': ['5', '6'],
      '12': ['7', '8'],
    },
    semiFinals: {
      '13': ['9', '10'],
      '14': ['11', '12'],
    },
    final: {
      '15': ['13', '14'],
    },
  };

  const determineWinner = (match: KnockoutMatch): string | null => {
    const { team1, team2, userPrediction } = match;
    const { team1: score1, team2: score2, winner } = userPrediction;

    if (score1 == null || score2 == null || !team1 || !team2) {
      return null;
    }

    if (score1 > score2) {
      return team1;
    } else if (score1 < score2) {
      return team2;
    } else {
      // Tie
      if (winner === 'team1') {
        return team1;
      } else if (winner === 'team2') {
        return team2;
      } else {
        // No winner selected yet
        return null;
      }
    }
  };

  const updateKnockoutProgression = (updatedMatches: typeof knockoutMatches) => {
    const newMatches = { ...updatedMatches };

    // Update QuarterFinals
    Object.entries(matchMappings.quarterFinals).forEach(([qfId, [r16aId, r16bId]]) => {
      const r16a = newMatches.roundOf16.find((m) => m.id === r16aId);
      const r16b = newMatches.roundOf16.find((m) => m.id === r16bId);

      const winnerA = r16a ? determineWinner(r16a) : null;
      const winnerB = r16b ? determineWinner(r16b) : null;

      const qfMatch = newMatches.quarterFinals.find((m) => m.id === qfId);
      if (qfMatch) {
        qfMatch.team1 = winnerA || '';
        qfMatch.team2 = winnerB || '';
      }
    });

    // Update Semifinals
    Object.entries(matchMappings.semiFinals).forEach(([sfId, [qfAId, qfBId]]) => {
      const qfA = newMatches.quarterFinals.find((m) => m.id === qfAId);
      const qfB = newMatches.quarterFinals.find((m) => m.id === qfBId);

      const winnerA = qfA ? determineWinner(qfA) : null;
      const winnerB = qfB ? determineWinner(qfB) : null;

      const sfMatch = newMatches.semiFinals.find((m) => m.id === sfId);
      if (sfMatch) {
        sfMatch.team1 = winnerA || '';
        sfMatch.team2 = winnerB || '';
      }
    });

    // Update Final
    Object.entries(matchMappings.final).forEach(([finalId, [sfAId, sfBId]]) => {
      const sfA = newMatches.semiFinals.find((m) => m.id === sfAId);
      const sfB = newMatches.semiFinals.find((m) => m.id === sfBId);

      const winnerA = sfA ? determineWinner(sfA) : null;
      const winnerB = sfB ? determineWinner(sfB) : null;

      newMatches.final.team1 = winnerA || '';
      newMatches.final.team2 = winnerB || '';
    });

    setKnockoutMatches(newMatches);
  };

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 py-12 px-4 overflow-auto flex flex-col">
      <div className="max-w-[1400px] mx-auto w-full">  {/* Increased max width */}
        {/* Welcome and Title */}
        {username && (
          <h1 className="text-3xl font-bold text-white mb-6"> {/* Larger font size */}
            Welcome, {username}
          </h1>
        )}
        <h1 className="text-5xl font-bold text-center text-white mb-10"> {/* Larger font size */}
          Make Your Predictions
        </h1>
  
        {/* Group Stage Matches and Standings */}
        <div className="flex flex-col md:flex-row">
          <div className="flex-1">
            {/* Group Stage Matches */}
            <GroupStageMatches
              matches={guesses.map((guess) => ({
                id: guess.match_id,
                homeTeam: guess.homeTeam,
                awayTeam: guess.awayTeam,
                date: guess.date,
                group: guess.group,
                userPrediction: guess.userPrediction,
              }))}
              loading={loadingGuesses}
              error={errorGuesses}
              handleInputChange={handleInputChange}
              sortCriteria={matchSortCriteria}
              setSortCriteria={setMatchSortCriteria}
            />
          </div>
  
          {/* Group Standings on the right */}
          <div className="w-full md:w-1/3 ml-8 overflow-x-auto"> {/* Adjusted width */}
            <GroupStandings
              groups={standings}
              loading={loadingGuesses}
              error={errorGuesses}
            />
          </div>
        </div>
  
        {/* Knockout Stage Section (with increased size and respect) */}
        <div className="w-full mt-16">  {/* Larger margin for spacing */}
          <div className="mx-auto max-w-[90%] md:max-w-[1000px]">  {/* Increase width of KnockoutBracket */}
            <KnockoutBracket
              matches={knockoutMatches}
              onScoreChange={handleKnockoutScoreChange}
              onWinnerSelect={handleKnockoutWinnerSelect}
            />
          </div>
        </div>
  
        {/* Top Goal Scorer */}
        <div className="w-full my-12">
          <TopGoalScorer
            players={players}
            selectedPlayer={selectedTopGoalScorer}
            setSelectedPlayer={setSelectedTopGoalScorer}
          />
        </div>
  
        {/* Submit Button */}
        <div className="text-center mt-12">
          <Button
            onClick={handleSubmitPredictions}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-lg">
            Submit All Predictions
          </Button>
        </div>
      </div>
    </div>
  );
  
}
  

export default PredictionsPage;
