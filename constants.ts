import { Move, MoveType, Target, Stance } from './types';

export const MAX_SCORE = 2; // Sanbon Shobu (first to 2 wins essentially, logic handled in engine)

export const MOVES: Record<string, Move> = {
  WAIT: {
    id: 'wait',
    name: 'Observe',
    japanese: 'Metsuke',
    type: MoveType.WAIT,
    target: Target.NONE,
    description: 'Wait and observe opponent.',
  },
  BLOCK: {
    id: 'block',
    name: 'Block/Parry',
    japanese: 'Uke',
    type: MoveType.DEFENSE,
    target: Target.NONE,
    description: 'Defend against incoming attacks.',
  },
  MEN: {
    id: 'men',
    name: 'Men Strike',
    japanese: 'Men',
    type: MoveType.ATTACK,
    target: Target.MEN,
    description: 'Strike to the head.',
  },
  KOTE: {
    id: 'kote',
    name: 'Kote Strike',
    japanese: 'Kote',
    type: MoveType.ATTACK,
    target: Target.KOTE,
    description: 'Strike to the wrist.',
  },
  DO: {
    id: 'do',
    name: 'Do Strike',
    japanese: 'Do',
    type: MoveType.ATTACK,
    target: Target.DO,
    description: 'Strike to the torso.',
  },
  DEBANA_MEN: {
    id: 'debana_men',
    name: 'Debana Men',
    japanese: 'Debana Men',
    type: MoveType.COUNTER,
    target: Target.MEN,
    counters: [Target.MEN, Target.KOTE], // Catches start of attack
    description: 'Strike Men just as opponent moves.',
  },
  NUKI_DO: {
    id: 'nuki_do',
    name: 'Nuki Do',
    japanese: 'Nuki Do',
    type: MoveType.COUNTER,
    target: Target.DO,
    counters: [Target.MEN], // Dodges Men and hits Do
    description: 'Dodge Men attack and strike Do.',
  },
  KAESHI_DO: {
    id: 'kaeshi_do',
    name: 'Kaeshi Do',
    japanese: 'Kaeshi Do',
    type: MoveType.COUNTER,
    target: Target.DO,
    counters: [Target.MEN],
    description: 'Block Men and immediately strike Do.',
  },
  SURIAGE_MEN: {
    id: 'suriage_men',
    name: 'Suriage Men',
    japanese: 'Suriage Men',
    type: MoveType.COUNTER,
    target: Target.MEN,
    counters: [Target.MEN],
    description: 'Deflect opponent sword up and strike Men.',
  }
};

export const STANCE_MOVES: Record<Stance, string[]> = {
  [Stance.CHUDAN]: ['MEN', 'KOTE', 'DO', 'BLOCK', 'DEBANA_MEN', 'NUKI_DO', 'KAESHI_DO'],
  [Stance.JODAN]: ['MEN', 'KOTE', 'DO', 'WAIT', 'DEBANA_MEN'], // Jodan is aggressive, less counters
};
