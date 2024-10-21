// components/ui/GroupStandings.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface GroupStandingsProps {
  groups: Group[];
  loading: boolean;
  error: string | null;
}

const GroupStandings: React.FC<GroupStandingsProps> = ({
  groups,
  loading,
  error,
}) => {
  return (
    <div className="w-full mb-8">
      {loading ? (
        <p className="text-white">Loading group standings...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        Array.isArray(groups) && groups.length > 0 ? (
          groups.map((group) => (
            <Card key={group.name} className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <CardHeader>
                <CardTitle>Group {group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>GF</TableHead>
                      <TableHead>GA</TableHead>
                      <TableHead>GD</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.teams.map((team) => (
                      <TableRow key={team.name}>
                        <TableCell>{team.name}</TableCell>
                        <TableCell>{team.points}</TableCell>
                        <TableCell>{team.goalsFor}</TableCell>
                        <TableCell>{team.goalsAgainst}</TableCell>
                        <TableCell>{team.goalsFor - team.goalsAgainst}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-white">No group data available.</p>
        )
      )}
    </div>
  );
};

export default GroupStandings;
