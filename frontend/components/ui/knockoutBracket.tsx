// components/ui/knockoutBracket.tsx

'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
 

interface UserPrediction {
  team1: number;
  team2: number;
  winner?: 'team1' | 'team2';
}

interface Match {
  id: string;
  team1: string;
  team2: string;
  userPrediction: UserPrediction;
}

interface KnockoutBracketProps {
  matches: {
    roundOf16: Match[];
    quarterFinals: Match[];
    semiFinals: Match[];
    final: Match;
  };
  onScoreChange: (
    roundKey: keyof KnockoutBracketProps['matches'],
    matchId: string,
    team: 'team1' | 'team2',
    score: number
  ) => void;
  onWinnerSelect: (
    roundKey: keyof KnockoutBracketProps['matches'],
    matchId: string,
    winner: 'team1' | 'team2'
  ) => void;
}

const MatchBox: React.FC<{
  match: Match;
  onScoreChange: (team: 'team1' | 'team2', score: number) => void;
  onWinnerSelect: (winner: 'team1' | 'team2') => void;
}> = ({ match, onScoreChange, onWinnerSelect }) => {
  const isTie = match.userPrediction.team1 === match.userPrediction.team2;

  return (
    <div className="bg-gray-700 p-4 rounded-md text-white text-sm w-48">
      <div className="flex justify-between items-center mb-2">
        <span
          className={`truncate flex-grow mr-2 ${!match.team1 ? 'text-gray-400 italic' : ''}`}
        >
          {match.team1 || '-'}
        </span>
        <input
          type="number"
          className="w-8 h-8 bg-gray-800 text-white rounded p-1 text-sm"
          value={match.userPrediction.team1}
          onChange={(e) => onScoreChange('team1', Number(e.target.value))}
          min={0}
          aria-label={`Score for ${match.team1 || 'No Team'}`}
          disabled={!match.team1} // Disable input if no team
        />
        {isTie && match.team1 && match.team2 && (
          <input
            type="radio"
            name={`winner-${match.id}`}
            checked={match.userPrediction.winner === 'team1'}
            onChange={() => onWinnerSelect('team1')}
            className="ml-2 w-4 h-4"
            aria-label={`Select ${match.team1 || 'No Team'} as winner`}
            disabled={!match.team1} // Disable radio if no team
          />
        )}
      </div>
      <div className="flex justify-between items-center">
        <span
          className={`truncate flex-grow mr-2 ${!match.team2 ? 'text-gray-400 italic' : ''}`}
        >
          {match.team2 || '-'}
        </span>
        <input
          type="number"
          className="w-8 h-8 bg-gray-800 text-white rounded p-1 text-sm"
          value={match.userPrediction.team2}
          onChange={(e) => onScoreChange('team2', Number(e.target.value))}
          min={0}
          aria-label={`Score for ${match.team2 || 'No Team'}`}
          disabled={!match.team2} // Disable input if no team
        />
        {isTie && match.team1 && match.team2 && (
          <input
            type="radio"
            name={`winner-${match.id}`}
            checked={match.userPrediction.winner === 'team2'}
            onChange={() => onWinnerSelect('team2')}
            className="ml-2 w-4 h-4"
            aria-label={`Select ${match.team2 || 'No Team'} as winner`}
            disabled={!match.team2} // Disable radio if no team
          />
        )}
      </div>
      {/* The message has been removed */}
    </div>
  );
};




const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ matches, onScoreChange, onWinnerSelect }) => {
  // Determine the champion based on the final match's winner
  const finalMatch = matches.final;
  const champion =
    finalMatch.userPrediction.team1 > finalMatch.userPrediction.team2
      ? finalMatch.team1
      : finalMatch.userPrediction.team1 < finalMatch.userPrediction.team2
      ? finalMatch.team2
      : finalMatch.userPrediction.winner === 'team1'
      ? finalMatch.team1
      : finalMatch.userPrediction.winner === 'team2'
      ? finalMatch.team2
      : '-';

  return (
    <div className="w-full bg-gray-800 p-4 rounded-lg overflow-x-auto">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Knockout Stage</h2>
      <div className="flex justify-center">
        <div className="grid grid-cols-7 gap-4">
          {/* Headers */}
          <div className="col-span-7 grid grid-cols-7 gap-4 mb-4">
            <h3 className="text-center text-white font-semibold col-span-1 text-s">Round of 16</h3>
            <h3 className="text-center text-white font-semibold col-span-1 text-s">Quarterfinals</h3>
            <h3 className="text-center text-white font-semibold col-span-1 text-s">Semifinals</h3>
            <h3 className="text-center text-white font-semibold col-span-1 text-s">Final</h3>
            <h3 className="text-center text-white font-semibold col-span-1 text-s">Semifinals</h3>
            <h3 className="text-center text-white font-semibold col-span-1 text-s">Quarterfinals</h3>
            <h3 className="text-center text-white font-semibold col-span-1 text-s">Round of 16</h3>
          </div>

          {/* Round of 16 - Left */}
          <div className="col-span-1 space-y-2">
            {matches.roundOf16.slice(0, 4).map((match) => (
              <div key={match.id}>
                <MatchBox
                  match={match}
                  onScoreChange={(team, score) => onScoreChange('roundOf16', match.id, team, score)}
                  onWinnerSelect={(winner) => onWinnerSelect('roundOf16', match.id, winner)}
                />
              </div>
            ))}
          </div>

          {/* Quarterfinals - Left */}
          <div className="col-span-1 space-y-28 mt-16">
            {matches.quarterFinals.slice(0, 2).map((match) => (
              <div key={match.id}>
                <MatchBox
                  match={match}
                  onScoreChange={(team, score) => onScoreChange('quarterFinals', match.id, team, score)}
                  onWinnerSelect={(winner) => onWinnerSelect('quarterFinals', match.id, winner)}
                />
              </div>
            ))}
          </div>

          {/* Semifinals - Left */}
          <div className="col-span-1 space-y-8 mt-44">
            {matches.semiFinals.slice(0, 1).map((match) => (
              <div key={match.id}>
                <MatchBox
                  match={match}
                  onScoreChange={(team, score) => onScoreChange('semiFinals', match.id, team, score)}
                  onWinnerSelect={(winner) => onWinnerSelect('semiFinals', match.id, winner)}
                />
              </div>
            ))}
          </div>

          {/* Final */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="relative mt-80">
              <MatchBox
                match={matches.final}
                onScoreChange={(team, score) => onScoreChange('final', matches.final.id, team, score)}
                onWinnerSelect={(winner) => onWinnerSelect('final', matches.final.id, winner)}
              />
            </div>
            <Trophy className="text-yellow-400 mt-4" size={30} />
            <div className="bg-yellow-600 p-4 rounded-md text-white text-l mt-4 text-center font-bold shadow-lg">
              {champion}
            </div>


          </div>

          {/* Semifinals - Right */}
          <div className="col-span-1 space-y-1 mt-44">
            {matches.semiFinals.slice(1, 2).map((match) => (
              <div key={match.id}>
                <MatchBox
                  match={match}
                  onScoreChange={(team, score) => onScoreChange('semiFinals', match.id, team, score)}
                  onWinnerSelect={(winner) => onWinnerSelect('semiFinals', match.id, winner)}
                />
              </div>
            ))}
          </div>

          {/* Quarterfinals - Right */}
          <div className="col-span-1 space-y-28 mt-16">
            {matches.quarterFinals.slice(2, 4).map((match) => (
              <div key={match.id}>
                <MatchBox
                  match={match}
                  onScoreChange={(team, score) => onScoreChange('quarterFinals', match.id, team, score)}
                  onWinnerSelect={(winner) => onWinnerSelect('quarterFinals', match.id, winner)}
                />
              </div>
            ))}
          </div>

          {/* Round of 16 - Right */}
          <div className="col-span-1 space-y-2">
            {matches.roundOf16.slice(4, 8).map((match) => (
              <div key={match.id}>
                <MatchBox
                  match={match}
                  onScoreChange={(team, score) => onScoreChange('roundOf16', match.id, team, score)}
                  onWinnerSelect={(winner) => onWinnerSelect('roundOf16', match.id, winner)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnockoutBracket;
