import { Guess, Group, GroupWinners, KnockoutMatch } from '@/types';

export const updateGroupStandings = (guesses: Guess[]): Group[] => {
  const groupMap: { [groupName: string]: { [teamName: string]: any } } = {};

  guesses.forEach((guess) => {
    const { group, homeTeam, awayTeam, userPrediction } = guess;
    
    if (!groupMap[group]) groupMap[group] = {};
    if (!groupMap[group][homeTeam]) groupMap[group][homeTeam] = { name: homeTeam, points: 0, goalsFor: 0, goalsAgainst: 0 };
    if (!groupMap[group][awayTeam]) groupMap[group][awayTeam] = { name: awayTeam, points: 0, goalsFor: 0, goalsAgainst: 0 };

    const homeTeamStats = groupMap[group][homeTeam];
    const awayTeamStats = groupMap[group][awayTeam];

    homeTeamStats.goalsFor += userPrediction.team1;
    homeTeamStats.goalsAgainst += userPrediction.team2;
    awayTeamStats.goalsFor += userPrediction.team2;
    awayTeamStats.goalsAgainst += userPrediction.team1;

    if (userPrediction.team1 > userPrediction.team2) {
      homeTeamStats.points += 3;
    } else if (userPrediction.team1 < userPrediction.team2) {
      awayTeamStats.points += 3;
    } else {
      homeTeamStats.points += 1;
      awayTeamStats.points += 1;
    }
  });

  return Object.entries(groupMap).map(([groupName, teams]) => ({
    name: groupName,
    teams: Object.values(teams).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const goalDiffA = a.goalsFor - a.goalsAgainst;
      const goalDiffB = b.goalsFor - b.goalsAgainst;
      if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.name.localeCompare(b.name);
    }),
  }));
};

export const updateKnockoutProgression = (
  knockoutMatches: { [key: string]: KnockoutMatch[] | KnockoutMatch },
  groupWinners: GroupWinners
) => {
  const updatedMatches = { ...knockoutMatches };

  // Update Round of 16
  updatedMatches.roundOf16 = (updatedMatches.roundOf16 as KnockoutMatch[]).map((match) => {
    let { team1, team2 } = match;
    const winnerGroupPattern = /^Winner Group (.+)$/;
    const runnerUpGroupPattern = /^Runner-up Group (.+)$/;

    const updateTeam = (teamName: string) => {
      const winnerMatch = teamName.match(winnerGroupPattern);
      const runnerUpMatch = teamName.match(runnerUpGroupPattern);
      if (winnerMatch) {
        return groupWinners[winnerMatch[1]]?.winner || teamName;
      } else if (runnerUpMatch) {
        return groupWinners[runnerUpMatch[1]]?.runnerUp || teamName;
      }
      return teamName;
    };

    team1 = updateTeam(team1);
    team2 = updateTeam(team2);

    return { ...match, team1, team2 };
  });

  // Helper function to determine the winner of a match
  const getWinner = (match: KnockoutMatch): string | null => {
    const { team1, team2, userPrediction } = match;
    if (!userPrediction || userPrediction.team1 == null || userPrediction.team2 == null) return null;
    if (userPrediction.team1 > userPrediction.team2) return team1;
    if (userPrediction.team1 < userPrediction.team2) return team2;
    return userPrediction.winner === 'team1' ? team1 : team2;
  };

  // Update Quarter Finals
  updatedMatches.quarterFinals = (updatedMatches.quarterFinals as KnockoutMatch[]).map((match, index) => {
    const r16Matches = updatedMatches.roundOf16 as KnockoutMatch[];
    const team1 = getWinner(r16Matches[index * 2]) || '';
    const team2 = getWinner(r16Matches[index * 2 + 1]) || '';
    return { ...match, team1, team2 };
  });

  // Update Semi Finals
  updatedMatches.semiFinals = (updatedMatches.semiFinals as KnockoutMatch[]).map((match, index) => {
    const qfMatches = updatedMatches.quarterFinals as KnockoutMatch[];
    const team1 = getWinner(qfMatches[index * 2]) || '';
    const team2 = getWinner(qfMatches[index * 2 + 1]) || '';
    return { ...match, team1, team2 };
  });

  // Update Final
  const sfMatches = updatedMatches.semiFinals as KnockoutMatch[];
  updatedMatches.final = {
    ...updatedMatches.final as KnockoutMatch,
    team1: getWinner(sfMatches[0]) || '',
    team2: getWinner(sfMatches[1]) || '',
  };

  return updatedMatches;
};