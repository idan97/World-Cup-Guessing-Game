// components/ui/GroupStageMatches.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface UserPrediction {
  team1: number;
  team2: number;
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  group: string;
  userPrediction: UserPrediction;
}

interface GroupStageMatchesProps {
  matches: Match[];
  loading: boolean;
  error: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, matchId: string, team: 'team1' | 'team2') => void;
  sortCriteria: 'date' | 'group';
  setSortCriteria: React.Dispatch<React.SetStateAction<'date' | 'group'>>;
}

const GroupStageMatches: React.FC<GroupStageMatchesProps> = ({
  matches,
  loading,
  error,
  handleInputChange,
  sortCriteria,
  setSortCriteria,
}) => {
  // Sorting matches based on criteria
  const sortedMatches = [...matches];
  if (sortCriteria === 'date') {
    sortedMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else {
    sortedMatches.sort((a, b) => a.group.localeCompare(b.group) || new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return (
    <div className="w-full mb-8">
      <Card className="bg-white rounded-lg shadow-lg p-6">
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <CardTitle>Group Stage Matches</CardTitle>
          {/* Sorting Dropdown */}
          <div className="mt-4 sm:mt-0">
            <select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value as 'date' | 'group')}
              className="border rounded p-2"
            >
              <option value="date">Sort Matches by Date</option>
              <option value="group">Sort Matches by Group</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading matches...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : matches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Your Prediction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{new Date(match.date).toLocaleString()}</TableCell>
                    <TableCell>{match.group}</TableCell>
                    <TableCell>
                      {match.homeTeam} vs {match.awayTeam}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="w-16"
                          value={match.userPrediction?.team1.toString() || '0'}
                          onChange={(e) => handleInputChange(e, match.id, 'team1')}
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="w-16"
                          value={match.userPrediction?.team2.toString() || '0'}
                          onChange={(e) => handleInputChange(e, match.id, 'team2')}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No matches available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupStageMatches;
