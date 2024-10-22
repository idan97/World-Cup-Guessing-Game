// frontend/pages/manager.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import KnockoutBracket from '@/components/ui/KnockoutBracket';
import GroupStageMatches from '@/components/ui/GroupStageMatches';
import GroupStandings from '@/components/ui/GroupStandings';
import { KnockoutMatch, Group, GroupWinners, UserPrediction, Team, Prediction } from '@/types';
import { fetchAllMatches, submitResults, submitDailySummary } from '@/lib/api';
import NavBar from "@/components/ui/NavBar";
import DailySummaryEditor from "@/components/ui/DailySummaryEditor";

interface Match {
  match_id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  group: string;
  result: UserPrediction; // Actual match result
}

const initialKnockoutMatchesData = {
  // Same as in predictions.tsx
  // ...
};

const ManagerPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Group[]>([]);
  const [groupWinners, setGroupWinners] = useState<GroupWinners>({});
  const [knockoutMatches, setKnockoutMatches] = useState(initialKnockoutMatchesData);
  const [matchSortCriteria, setMatchSortCriteria] = useState<'date' | 'group'>('date');
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true);
  const [errorMatches, setErrorMatches] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState<string>(''); // New state for daily summary

  // Check authentication and manager role
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role'); // Assume role is stored

    if (!storedToken || storedRole !== 'manager') {
      router.push('/');
    } else {
      setToken(storedToken);
      setUsername(storedUsername);
      setIsAuthenticated(true);
    }
  }, [router]);

  // Load matches
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const loadMatches = async () => {
      try {
        const data = await fetchAllMatches(token); // Fetch all matches

        // Assuming data is an array of matches
        const matchesWithResults = data.map((match: any) => ({
          match_id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          date: match.date,
          group: match.group,
          result: match.result || { team1: 0, team2: 0 }, // Initialize result if not present
        }));

        setMatches(matchesWithResults);
        // Update group standings based on the matches
        updateGroupStandings(matchesWithResults);

        // Initialize knockoutMatches if needed
        // ...

      } catch (error: any) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoadingMatches(false);
      }
    };

    loadMatches();
  }, [isAuthenticated, token]);

  // Handle input changes for matches
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    matchId: string,
    team: 'team1' | 'team2'
  ) => {
    let value = e.target.value.replace(/^0+/, '');
    if (value === '') value = '0';
    handleResultChange(matchId, team, Number(value));
  };

  // Handle changes in match results
  const handleResultChange = (matchId: string, team: 'team1' | 'team2', score: number) => {
    if (score < 0) score = 0;

    const updatedMatches = matches.map((match) =>
      match.match_id === matchId
        ? {
            ...match,
            result: {
              ...match.result,
              [team]: score,
            },
          }
        : match
    );

    setMatches(updatedMatches);
    updateGroupStandings(updatedMatches);
  };

  const updateGroupStandings = (updatedMatches: Match[]) => {
    const groupMap: { [groupName: string]: { [teamName: string]: Team } } = {};

    // Calculate points and goals for each team
    updatedMatches.forEach((match) => {
      const groupName = match.group;
      if (!groupMap[groupName]) {
        groupMap[groupName] = {};
      }

      const homeTeamName = match.homeTeam;
      const awayTeamName = match.awayTeam;

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
    updatedMatches.forEach((match) => {
      const groupName = match.group;
      const homeTeam = groupMap[groupName][match.homeTeam];
      const awayTeam = groupMap[groupName][match.awayTeam];
      const result = match.result;

      if (homeTeam && awayTeam) {
        homeTeam.goalsFor += result.team1;
        homeTeam.goalsAgainst += result.team2;
        awayTeam.goalsFor += result.team2;
        awayTeam.goalsAgainst += result.team1;

        if (result.team1 > result.team2) {
          homeTeam.points += 3;
        } else if (result.team1 < result.team2) {
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

  // Handle knockout score changes (similar to predictions page)
  const handleKnockoutScoreChange = (
    roundKey: keyof typeof knockoutMatches,
    matchId: string,
    team: 'team1' | 'team2',
    score: number
  ) => {
    // Similar logic as in predictions.tsx
    // ...
  };

  const handleKnockoutWinnerSelect = (
    roundKey: keyof typeof knockoutMatches,
    matchId: string,
    winner: 'team1' | 'team2'
  ) => {
    // Similar logic as in predictions.tsx
    // ...
  };

  const handleSubmitResults = async () => {
    if (!token) return;

    try {
      // Combine all results
      const allResults: {
        match_id: string;
        homeTeam: string;
        awayTeam: string;
        date: string | null;
        group: string | null;
        round: string;
        result: UserPrediction;
      }[] = [];

      // Group stage results
      matches.forEach((match) => {
        allResults.push({
          match_id: match.match_id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          date: match.date,
          group: match.group,
          round: 'Group',
          result: match.result,
        });
      });

      // Knockout stage results
      Object.entries(knockoutMatches).forEach(([roundKey, matches]) => {
        const roundName = roundKey;
        if (Array.isArray(matches)) {
          matches.forEach((match) => {
            allResults.push({
              match_id: match.id,
              homeTeam: match.team1,
              awayTeam: match.team2,
              date: null,
              group: null,
              round: roundName,
              result: match.userPrediction,
            });
          });
        } else {
          const match = matches;
          allResults.push({
            match_id: match.id,
            homeTeam: match.team1,
            awayTeam: match.team2,
            date: null,
            group: null,
            round: 'Final',
            result: match.userPrediction,
          });
        }
      });

      // Submit the results to the backend
      await submitResults(token, { results: allResults });
      console.log('Results submitted successfully');

      // After submitting results, you may want to trigger leaderboard updates, etc.
    } catch (error: any) {
      console.error('Error submitting results:', error);
    }
  };

  const handlePublishSummary = async () => {
    if (!token) return;

    try {
      // Submit the daily summary to the backend
      await submitDailySummary(token, { content: dailySummary });
      console.log('Daily summary published successfully');
      alert('Daily summary published successfully');
      setDailySummary(''); // Clear the editor
    } catch (error: any) {
      console.error('Error publishing daily summary:', error);
    }
  };

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 overflow-auto flex flex-col">
      <NavBar username={username} />
      {/* Main content */}
      <div className="py-12 px-4 flex-grow">
        <div className="max-w-[1400px] mx-auto w-full">
          <h1 className="text-5xl font-bold text-center text-white mb-10">
            Manager Dashboard
          </h1>

          {/* Daily Summary Editor */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Publish Daily Summary</h2>
            <DailySummaryEditor
              content={dailySummary}
              setContent={setDailySummary}
              onPublish={handlePublishSummary}
            />
          </div>

          {/* Group Stage Matches and Standings */}
          <div className="flex flex-col md:flex-row">
            <div className="flex-1">
              {/* Group Stage Matches */}
              <GroupStageMatches
                matches={matches.map((match) => ({
                  id: match.match_id,
                  homeTeam: match.homeTeam,
                  awayTeam: match.awayTeam,
                  date: match.date,
                  group: match.group,
                  userPrediction: match.result, // Use 'result' instead of 'userPrediction'
                }))}
                loading={loadingMatches}
                error={errorMatches}
                handleInputChange={handleInputChange}
                sortCriteria={matchSortCriteria}
                setSortCriteria={setMatchSortCriteria}
                isManager={true} // Optional prop to indicate manager mode
              />
            </div>
            {/* Group Standings on the right */}
            <div className="w-full md:w-1/3 ml-8 overflow-x-auto">
              <GroupStandings
                groups={standings}
                loading={loadingMatches}
                error={errorMatches}
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
                isManager={true} // Optional prop to indicate manager mode
              />
            </div>
          </div>
          {/* Submit Button */}
          <div className="text-center mt-12">
            <Button
              onClick={handleSubmitResults}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-lg text-white">
              Submit All Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
