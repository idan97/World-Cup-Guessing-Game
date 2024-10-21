// components/ui/TopGoalScorer.tsx

'use client';

import React, { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid'; // Updated import

interface Player {
  id: string;
  name: string;
}

interface TopGoalScorerProps {
  players: Player[];
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
}

const TopGoalScorer: React.FC<TopGoalScorerProps> = ({ players, selectedPlayer, setSelectedPlayer }) => {
  const [query, setQuery] = useState('');

  const filteredPlayers =
    query === ''
      ? players
      : players.filter((player) =>
          player.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="w-full max-w-md mx-auto relative"> {/* Added 'relative' */}
      <Combobox value={selectedPlayer} onChange={setSelectedPlayer}>
        <Combobox.Label className="block text-sm font-medium text-white">Top Goal Scorer</Combobox.Label>
        <div className="relative mt-1">
          <Combobox.Input
            className="w-full border border-gray-300 rounded-md bg-gray-700 text-white py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            displayValue={(player: Player) => player?.name || ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Select a player..."
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredPlayers.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-400">
                  No players found.
                </div>
              ) : (
                filteredPlayers.map((player) => (
                  <Combobox.Option
                    key={player.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-white'
                      }`
                    }
                    value={player}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {player.name}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default TopGoalScorer;
