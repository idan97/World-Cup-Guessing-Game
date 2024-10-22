// frontend/pages/predictions.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import KnockoutBracket from '@/components/ui/knockoutBracket';
import GroupStageMatches from '@/components/ui/GroupStageMatches';
import GroupStandings from '@/components/ui/GroupStandings';
import TopGoalScorer from '@/components/ui/TopGoalScorer';
import { KnockoutMatch, Group, GroupWinners, Player, UserPrediction, Team, Prediction } from '@/types';
import { fetchGuesses, submitPredictions } from '@/lib/api';
import NavBar from "@/components/ui/NavBar";

interface Guess {
  match_id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  group: string;
  userPrediction: UserPrediction;
}


// Initial Knockout Matches Data with team1Source and team2Source
const initialKnockoutMatchesData = {
  roundOf16: [
    {
      id: '1',
      team1: 'Winner Group A',
      team2: 'Runner-up Group B',
      team1Source: { group: 'Group A', position: 'winner' },
      team2Source: { group: 'Group B', position: 'runnerUp' },
      userPrediction: { team1: 0, team2: 0 },
    },
    {
      id: '2',
      team1: 'Winner Group C',
      team2: 'Runner-up Group D',
      team1Source: { group: 'Group C', position: 'winner' },
      team2Source: { group: 'Group D', position: 'runnerUp' },
      userPrediction: { team1: 0, team2: 0 },
    },
    {
      id: '3',
      team1: 'Winner Group E',
      team2: 'Runner-up Group F',
      team1Source: { group: 'Group E', position: 'winner' },
      team2Source: { group: 'Group F', position: 'runnerUp' },
      userPrediction: { team1: 0, team2: 0 },
    },
    {
      id: '4',
      team1: 'Winner Group G',
      team2: 'Runner-up Group H',
      team1Source: { group: 'Group G', position: 'winner' },
      team2Source: { group: 'Group H', position: 'runnerUp' },
      userPrediction: { team1: 0, team2: 0 },
    },
    {
      id: '5',
      team1: 'Winner Group B',
      team2: 'Runner-up Group A',
      team1Source: { group: 'Group B', position: 'winner' },
      team2Source: { group: 'Group A', position: 'runnerUp' },
      userPrediction: { team1: 0, team2: 0 },
    },
    {
      id: '6',
      team1: 'Winner Group D',
      team2: 'Runner-up Group C',
      team1Source: { group: 'Group D', position: 'winner' },
      team2Source: { group: 'Group C', position: 'runnerUp' },
      userPrediction: { team1: 0, team2: 0 },
    },
    {
      id: '7',
      team1: 'Winner Group F',
      team2: 'Runner-up Group E',
      team1Source: { group: 'Group F', position: 'winner' },
      team2Source: { group: 'Group E', position: 'runnerUp' },
      userPrediction: { team1: 0, team2: 0 },
    },
    {
      id: '8',
      team1: 'Winner Group H',
      team2: 'Runner-up Group G',
      team1Source: { group: 'Group H', position: 'winner' },
      team2Source: { group: 'Group G', position: 'runnerUp' },
      userPrediction: { team1: 0, team2: 0 },
    },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State for Top Goal Scorer
  const [selectedTopGoalScorer, setSelectedTopGoalScorer] = useState<Player | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);
  const [errorPlayers, setErrorPlayers] = useState<string | null>(null);

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

  // Load guesses and predictions
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const loadGuesses = async () => {
      try {
        const data = await fetchGuesses(token);

        const predictions = data.predictions;

        // Separate group and knockout predictions
        const groupStagePredictions = predictions.filter(
          (pred: Prediction) => pred.round === 'Group'
        );
        const knockoutStagePredictions = predictions.filter(
          (pred: Prediction) => pred.round !== 'Group' && pred.round !== 'TopGoalScorer'
        );

        // Set guesses directly from groupStagePredictions
        setGuesses(groupStagePredictions);
        updateGroupStandings(groupStagePredictions);

        // Update knockout matches without overwriting team1 and team2
        const updatedKnockoutMatches = { ...initialKnockoutMatchesData };

        knockoutStagePredictions.forEach((prediction: Prediction) => {
          const roundKey = prediction.round;
          const matchId = prediction.match_id;

          if (roundKey === 'Final') {
            if (updatedKnockoutMatches.final.id === matchId) {
              updatedKnockoutMatches.final = {
                ...updatedKnockoutMatches.final,
                userPrediction: prediction.userPrediction,
              };
            }
          } else {
            const matches = updatedKnockoutMatches[roundKey as keyof typeof updatedKnockoutMatches];
            if (Array.isArray(matches)) {
              const index = matches.findIndex((match) => match.id === matchId);
              if (index !== -1) {
                matches[index] = {
                  ...matches[index],
                  userPrediction: prediction.userPrediction,
                };
              }
            }
          }
        });

        setKnockoutMatches(updatedKnockoutMatches);

        // Set top goal scorer
        if (data.topGoalScorer) {
          const player = players.find((p) => p.name === data.topGoalScorer);
          if (player) {
            setSelectedTopGoalScorer(player);
          }
        }
      } catch (error: any) {
        console.error('Error fetching guesses:', error);
      } finally {
        setLoadingGuesses(false);
      }
    };

    loadGuesses();
  }, [isAuthenticated, token]);

  const handleSubmitPredictions = async () => {
    if (!token) return;

    // Validate knockout matches
    const invalidKnockoutMatches = [];
    Object.entries(knockoutMatches).forEach(([roundKey, matches]) => {
      if (Array.isArray(matches)) {
        matches.forEach((match) => {
          if (match.team1 === '' || match.team2 === '') {
            invalidKnockoutMatches.push(match);
          }
        });
      } else {
        const match = matches;
        if (match.team1 === '' || match.team2 === '') {
          invalidKnockoutMatches.push(match);
        }
      }
    });

    // Check if the champion is selected
    const champion = determineWinner(knockoutMatches.final);

    if (invalidKnockoutMatches.length > 0 || !champion) {
      alert('Please complete all knockout matches before submitting your predictions.');
      return;
    }
    try {
      // Combine all predictions
      const allPredictions: {
        username: string | null;
        match_id: string;
        homeTeam: string;
        awayTeam: string;
        date: string | null;
        group: string | null;
        round: string;
        userPrediction: UserPrediction;
      }[] = [];

      // Group stage predictions
      guesses.forEach((guess) => {
        allPredictions.push({
          username, // Include username if required
          match_id: guess.match_id,
          homeTeam: guess.homeTeam,
          awayTeam: guess.awayTeam,
          date: guess.date,
          group: guess.group,
          round: 'Group',
          userPrediction: guess.userPrediction,
        });
      });

      // Knockout stage predictions
      Object.entries(knockoutMatches).forEach(([roundKey, matches]) => {
        const roundName = roundKey; // Adjust if needed
        if (Array.isArray(matches)) {
          matches.forEach((match) => {
            allPredictions.push({
              username,
              match_id: match.id,
              homeTeam: match.team1,
              awayTeam: match.team2,
              date: null,
              group: null,
              round: roundName,
              userPrediction: match.userPrediction,
            });
          });
        } else {
          const match = matches;
          allPredictions.push({
            username,
            match_id: match.id,
            homeTeam: match.team1,
            awayTeam: match.team2,
            date: null,
            group: null,
            round: 'Final',
            userPrediction: match.userPrediction,
          });
        }
      });

      const payload = {
        predictions: allPredictions,
        topGoalScorer: selectedTopGoalScorer ? selectedTopGoalScorer.name : null,
      };

      await submitPredictions(token, payload);
      console.log('Predictions submitted successfully');
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

    setKnockoutMatches((prevKnockoutMatches) => {
      const updatedRoundOf16 = prevKnockoutMatches.roundOf16.map((match) => {
        let team1 = match.team1;
        let team2 = match.team2;

        if (match.team1Source) {
          const { group, position } = match.team1Source;
          if (position === 'winner') {
            team1 = groupWinners[group]?.winner || match.team1;
          } else if (position === 'runnerUp') {
            team1 = groupWinners[group]?.runnerUp || match.team1;
          }
        }

        if (match.team2Source) {
          const { group, position } = match.team2Source;
          if (position === 'winner') {
            team2 = groupWinners[group]?.winner || match.team2;
          } else if (position === 'runnerUp') {
            team2 = groupWinners[group]?.runnerUp || match.team2;
          }
        }

        return {
          ...match,
          team1,
          team2,
        };
      });

      const updatedKnockoutMatches = {
        ...prevKnockoutMatches,
        roundOf16: updatedRoundOf16,
      };

      // Update the progression
      const fullyUpdatedKnockoutMatches = updateKnockoutProgression(updatedKnockoutMatches);

      return fullyUpdatedKnockoutMatches;
    });
  }, [groupWinners]);

  // Handle knockout score changes
  const handleKnockoutScoreChange = (
    roundKey: keyof typeof knockoutMatches,
    matchId: string,
    team: 'team1' | 'team2',
    score: number
  ) => {
    if (score < 0) score = 0;

    setKnockoutMatches((prevMatches) => {
      let updatedMatches;

      if (roundKey === 'final') {
        const updatedFinal = {
          ...prevMatches.final,
          userPrediction: {
            ...prevMatches.final.userPrediction,
            [team]: score,
            winner: undefined, // Reset winner when score changes
          },
        };
        updatedMatches = { ...prevMatches, final: updatedFinal };
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
        updatedMatches = { ...prevMatches, [roundKey]: updatedRound };
      }

      const fullyUpdatedMatches = updateKnockoutProgression(updatedMatches);
      return fullyUpdatedMatches;
    });
  };

  // Handle knockout winner selection
  const handleKnockoutWinnerSelect = (
    roundKey: keyof typeof knockoutMatches,
    matchId: string,
    winner: 'team1' | 'team2'
  ) => {
    setKnockoutMatches((prevMatches) => {
      let updatedMatches;

      if (roundKey === 'final') {
        const updatedFinal = {
          ...prevMatches.final,
          userPrediction: {
            ...prevMatches.final.userPrediction,
            winner,
          },
        };
        updatedMatches = { ...prevMatches, final: updatedFinal };
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
        updatedMatches = { ...prevMatches, [roundKey]: updatedRound };
      }

      const fullyUpdatedMatches = updateKnockoutProgression(updatedMatches);
      return fullyUpdatedMatches;
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

    // Update Quarterfinals
    Object.entries(matchMappings.quarterFinals).forEach(([qfId, [r16aId, r16bId]]) => {
      const r16a = newMatches.roundOf16.find((m) => m.id === r16aId);
      const r16b = newMatches.roundOf16.find((m) => m.id === r16bId);

      const winnerA = r16a ? determineWinner(r16a) : '';
      const winnerB = r16b ? determineWinner(r16b) : '';

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

      const winnerA = qfA ? determineWinner(qfA) : '';
      const winnerB = qfB ? determineWinner(qfB) : '';

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

      const winnerA = sfA ? determineWinner(sfA) : '';
      const winnerB = sfB ? determineWinner(sfB) : '';

      newMatches.final.team1 = winnerA || '';
      newMatches.final.team2 = winnerB || '';
    });

    return newMatches;
  };

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 overflow-auto flex flex-col">
      
      {/* Main content */}
      <div className="py-12 px-4 flex-grow">
        <div className="max-w-[1400px] mx-auto w-full">
          <h1 className="text-5xl font-bold text-center text-white mb-10">
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
            <div className="w-full md:w-1/3 ml-8 overflow-x-auto">
              <GroupStandings
                groups={standings}
                loading={loadingGuesses}
                error={errorGuesses}
              />
            </div>
          </div>
          {/* Knockout Stage Section */}
          <div className="w-full mt-16">
            <div className="mx-auto w-full">
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
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-lg text-white">
              Submit All Predictions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsPage;
