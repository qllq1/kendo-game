export enum Stance {
  CHUDAN = 'Chudan (Middle)',
  JODAN = 'Jodan (High)',
}

export enum MoveType {
  ATTACK = 'ATTACK',
  COUNTER = 'COUNTER',
  DEFENSE = 'DEFENSE',
  WAIT = 'WAIT',
}

export enum Target {
  MEN = 'MEN',
  KOTE = 'KOTE',
  DO = 'DO',
  TSUKI = 'TSUKI',
  NONE = 'NONE',
}

export interface Move {
  id: string;
  name: string;
  type: MoveType;
  target: Target;
  counters?: Target[]; // What this move effectively counters
  description: string;
  japanese: string;
}

export enum GamePhase {
  STANCE_SELECTION = 'STANCE_SELECTION',
  COMBAT = 'COMBAT',
  RESOLUTION = 'RESOLUTION',
  GAME_OVER = 'GAME_OVER',
}

export interface PlayerState {
  id: 'p1' | 'cpu';
  name: string;
  stance: Stance | null;
  score: number; // Ippon count
  currentMove: Move | null;
  stamina: number; // For visual flair
}

export interface TurnResult {
  winner: 'p1' | 'cpu' | 'draw' | null;
  reason: string;
  narrative: string;
  p1Action: string;
  cpuAction: string;
  ippon: boolean;
}
