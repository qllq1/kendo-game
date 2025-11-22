import { Move, MoveType, TurnResult, PlayerState, Target } from '../types';
import { MOVES } from '../constants';

export const resolveTurn = (
  p1: PlayerState,
  cpu: PlayerState,
  p1Move: Move,
  cpuMove: Move
): TurnResult => {
  let result: TurnResult = {
    winner: null,
    reason: '',
    narrative: '',
    p1Action: p1Move.name,
    cpuAction: cpuMove.name,
    ippon: false,
  };

  // Case 1: Both Wait or Block
  if (
    (p1Move.type === MoveType.WAIT || p1Move.type === MoveType.DEFENSE) &&
    (cpuMove.type === MoveType.WAIT || cpuMove.type === MoveType.DEFENSE)
  ) {
    result.winner = 'draw';
    result.reason = 'Stalemate';
    result.narrative = 'Both fighters observe each other cautiously. The tension rises.';
    return result;
  }

  // Case 2: Attack vs Wait/Open
  if (p1Move.type === MoveType.ATTACK && cpuMove.type === MoveType.WAIT) {
    result.winner = 'p1';
    result.ippon = true;
    result.reason = 'Uncontested Strike';
    result.narrative = `Red strikes ${p1Move.japanese} while White is hesitant!`;
    return result;
  }
  if (cpuMove.type === MoveType.ATTACK && p1Move.type === MoveType.WAIT) {
    result.winner = 'cpu';
    result.ippon = true;
    result.reason = 'Uncontested Strike';
    result.narrative = `White strikes ${cpuMove.japanese} seizing the opening!`;
    return result;
  }

  // Case 3: Attack vs Block
  if (p1Move.type === MoveType.ATTACK && cpuMove.type === MoveType.DEFENSE) {
    result.winner = 'draw';
    result.reason = 'Blocked';
    result.narrative = `Red's ${p1Move.japanese} is blocked by White!`;
    return result;
  }
  if (cpuMove.type === MoveType.ATTACK && p1Move.type === MoveType.DEFENSE) {
    result.winner = 'draw';
    result.reason = 'Blocked';
    result.narrative = `White's ${cpuMove.japanese} is firmly blocked by Red!`;
    return result;
  }

  // Case 4: Counter Logic
  // P1 Countering CPU
  if (p1Move.type === MoveType.COUNTER && cpuMove.type === MoveType.ATTACK) {
    if (p1Move.counters?.includes(cpuMove.target)) {
      result.winner = 'p1';
      result.ippon = true;
      result.reason = 'Perfect Counter';
      result.narrative = `Red executes ${p1Move.japanese} perfectly against White's ${cpuMove.japanese}!`;
      return result;
    } else {
      // Failed counter (timing off or wrong read) -> Attacker wins
      result.winner = 'cpu';
      result.ippon = true;
      result.reason = 'Failed Counter';
      result.narrative = `Red attempts ${p1Move.japanese} but White's ${cpuMove.japanese} is too fast!`;
      return result;
    }
  }
  
  // CPU Countering P1
  if (cpuMove.type === MoveType.COUNTER && p1Move.type === MoveType.ATTACK) {
    if (cpuMove.counters?.includes(p1Move.target)) {
      result.winner = 'cpu';
      result.ippon = true;
      result.reason = 'Perfect Counter';
      result.narrative = `White counters with ${cpuMove.japanese} against Red's ${p1Move.japanese}!`;
      return result;
    } else {
      result.winner = 'p1';
      result.ippon = true;
      result.reason = 'Failed Counter';
      result.narrative = `White misses the timing on ${cpuMove.japanese}, Red connects with ${p1Move.japanese}!`;
      return result;
    }
  }

  // Case 5: Aiuchi (Clash) - Attack vs Attack
  if (p1Move.type === MoveType.ATTACK && cpuMove.type === MoveType.ATTACK) {
    // Simple logic: Men beats Kote (reach), Kote beats Do (speed), Do beats Men (if stepped in, but usually Men has priority).
    // Let's prioritize Debana logic elsewhere, here is pure simul-strike.
    // For simplicity: Randomize winner or Draw.
    // Let's say Men > Kote > Do > Men to make it RPS-like
    
    if (p1Move.target === cpuMove.target) {
      result.winner = 'draw';
      result.reason = 'Aiuchi (Clash)';
      result.narrative = 'Both fighters strike simultaneously! No point awarded.';
      return result;
    }

    // RPS Hierarchy
    const rps = (a: Target, b: Target) => {
        if (a === Target.MEN && b === Target.KOTE) return true; // Men reach > Kote
        if (a === Target.KOTE && b === Target.DO) return true; // Kote speed > Do
        if (a === Target.DO && b === Target.MEN) return true; // Do dodges Men often
        return false;
    };

    if (rps(p1Move.target, cpuMove.target)) {
         result.winner = 'p1';
         result.ippon = true;
         result.reason = 'Superior Technique';
         result.narrative = `Red's ${p1Move.japanese} overpowers White's ${cpuMove.japanese}.`;
         return result;
    } else if (rps(cpuMove.target, p1Move.target)) {
         result.winner = 'cpu';
         result.ippon = true;
         result.reason = 'Superior Technique';
         result.narrative = `White's ${cpuMove.japanese} beats Red's ${p1Move.japanese}.`;
         return result;
    } else {
        result.winner = 'draw';
        result.reason = 'Clash';
        result.narrative = 'A messy clash of bamboo swords.';
        return result;
    }
  }

  // Fallback
  result.winner = 'draw';
  result.reason = 'Confusion';
  result.narrative = 'The judges are confused.';
  return result;
};

export const getCPUMove = (difficulty: 'easy' | 'hard', availableMoves: string[]): Move => {
  const randomKey = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  return MOVES[randomKey];
};
