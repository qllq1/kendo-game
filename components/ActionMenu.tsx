import React from 'react';
import { MOVES, STANCE_MOVES } from '../constants';
import { Stance, MoveType, Move } from '../types';

interface ActionMenuProps {
  stance: Stance;
  onSelectMove: (move: Move) => void;
  disabled: boolean;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ stance, onSelectMove, disabled }) => {
  const availableKeys = STANCE_MOVES[stance];

  const attacks = availableKeys
    .map(k => MOVES[k])
    .filter(m => m.type === MoveType.ATTACK);
  
  const counters = availableKeys
    .map(k => MOVES[k])
    .filter(m => m.type === MoveType.COUNTER || m.type === MoveType.DEFENSE);

  const others = availableKeys
    .map(k => MOVES[k])
    .filter(m => m.type === MoveType.WAIT);

  const ButtonGroup = ({ title, moves, colorClass }: { title: string, moves: Move[], colorClass: string }) => (
    <div className="mb-4">
      <h3 className="text-xs uppercase tracking-widest mb-2 text-gray-400 border-b border-gray-700 pb-1">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {moves.map((move) => (
          <button
            key={move.id}
            onClick={() => onSelectMove(move)}
            disabled={disabled}
            className={`
              p-3 rounded border-2 transition-all relative overflow-hidden group
              disabled:opacity-50 disabled:cursor-not-allowed
              ${colorClass}
            `}
          >
            <div className="relative z-10 flex flex-col items-start">
              <span className="text-lg font-bold">{move.japanese}</span>
              <span className="text-xs opacity-80">{move.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700 backdrop-blur-sm h-full overflow-y-auto">
      <ButtonGroup 
        title="Shikake-Waza (Offense)" 
        moves={attacks} 
        colorClass="border-red-900/50 bg-red-900/20 hover:bg-red-800/40 hover:border-red-500 text-red-100" 
      />
      <ButtonGroup 
        title="Oji-Waza (Counter/Defense)" 
        moves={counters} 
        colorClass="border-blue-900/50 bg-blue-900/20 hover:bg-blue-800/40 hover:border-blue-500 text-blue-100" 
      />
       <ButtonGroup 
        title="Other" 
        moves={others} 
        colorClass="border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 text-gray-200" 
      />
    </div>
  );
};

export default ActionMenu;
