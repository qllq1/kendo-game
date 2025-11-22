import React, { useState, useEffect, useRef } from 'react';
import { Stance, GamePhase, PlayerState, TurnResult, Move } from './types';
import { MOVES, STANCE_MOVES, MAX_SCORE } from './constants';
import { resolveTurn, getCPUMove } from './services/gameLogic';
import { getShinpanCommentary } from './services/geminiService';
import KendoSprite from './components/KendoSprite';
import ActionMenu from './components/ActionMenu';
import { Swords, Shield, Trophy, RefreshCw, Info, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.STANCE_SELECTION);
  
  const [p1, setP1] = useState<PlayerState>({
    id: 'p1', name: 'Red Player', stance: null, score: 0, currentMove: null, stamina: 100
  });
  
  const [cpu, setCpu] = useState<PlayerState>({
    id: 'cpu', name: 'White CPU', stance: null, score: 0, currentMove: null, stamina: 100
  });

  const [turnResult, setTurnResult] = useState<TurnResult | null>(null);
  const [commentary, setCommentary] = useState<string>("");
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  // Animations trigger
  const [animating, setAnimating] = useState(false);

  // Select Stance
  const handleStanceSelect = (stance: Stance) => {
    setP1(prev => ({ ...prev, stance }));
    // CPU selects stance randomly
    const cpuStance = Math.random() > 0.3 ? Stance.CHUDAN : Stance.JODAN;
    setCpu(prev => ({ ...prev, stance: cpuStance }));
    setPhase(GamePhase.COMBAT);
    setCommentary("Hajime! (Begin!)");
  };

  // Handle Move Selection
  const handleMoveSelect = async (move: Move) => {
    if (phase !== GamePhase.COMBAT || animating) return;

    // 1. Determine CPU Move
    if (!cpu.stance) return; // Should not happen
    const cpuAvailable = STANCE_MOVES[cpu.stance];
    const cpuAction = getCPUMove('easy', cpuAvailable);

    // 2. Resolve Turn
    const result = resolveTurn(p1, cpu, move, cpuAction);
    setTurnResult(result);
    
    // 3. Animate
    setPhase(GamePhase.RESOLUTION);
    setAnimating(true);

    // 4. Update State after small delay for impact
    setTimeout(() => {
      if (result.winner === 'p1' && result.ippon) {
        setP1(prev => ({ ...prev, score: prev.score + 1 }));
      } else if (result.winner === 'cpu' && result.ippon) {
        setCpu(prev => ({ ...prev, score: prev.score + 1 }));
      }
    }, 500); // Halfway through animation

    // 5. Fetch Gemini Commentary
    setLoadingCommentary(true);
    getShinpanCommentary(result, p1, cpu).then(text => {
      setCommentary(text);
      setLoadingCommentary(false);
    });

    // 6. Reset for next turn or End Game
    setTimeout(() => {
      setAnimating(false);
      
      // Check win condition inside the timeout to use latest state, 
      // but functional state updates are tricky with closures.
      // We check based on PREDICTED score.
      const newP1Score = (result.winner === 'p1' && result.ippon) ? p1.score + 1 : p1.score;
      const newCpuScore = (result.winner === 'cpu' && result.ippon) ? cpu.score + 1 : cpu.score;

      if (newP1Score >= MAX_SCORE || newCpuScore >= MAX_SCORE) {
        setPhase(GamePhase.GAME_OVER);
      } else {
        setPhase(GamePhase.COMBAT);
      }
    }, 2500);
  };

  const resetGame = () => {
    setP1({ ...p1, score: 0, stance: null });
    setCpu({ ...cpu, score: 0, stance: null });
    setPhase(GamePhase.STANCE_SELECTION);
    setTurnResult(null);
    setCommentary("");
  };

  // Renderers
  const renderStanceSelection = () => (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-8 animate-fadeIn">
      <h1 className="text-4xl md:text-6xl font-bold text-white pixel-font text-center text-red-600 drop-shadow-lg">
        KENDO MASTER
      </h1>
      <p className="text-gray-400 text-lg">Sanbon Shobu (Three Point Match)</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <button 
          onClick={() => handleStanceSelect(Stance.CHUDAN)}
          className="group relative p-8 border-4 border-blue-800 bg-gray-900 rounded-xl hover:bg-blue-900/50 transition-all hover:scale-105"
        >
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-blue-300">CHUDAN</h2>
            <p className="text-sm text-gray-400 mt-2">Middle Stance</p>
            <p className="text-xs text-gray-500 mt-1">Balanced offense & defense.</p>
          </div>
        </button>

        <button 
          onClick={() => handleStanceSelect(Stance.JODAN)}
          className="group relative p-8 border-4 border-red-800 bg-gray-900 rounded-xl hover:bg-red-900/50 transition-all hover:scale-105"
        >
          <div className="text-center">
            <Swords className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-300">JODAN</h2>
            <p className="text-sm text-gray-400 mt-2">High Stance</p>
            <p className="text-xs text-gray-500 mt-1">Aggressive. High risk, high reward.</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderCombat = () => (
    <div className="flex flex-col h-full">
      {/* Score Board */}
      <header className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
             <span className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
             <span className="font-bold text-xl tracking-widest">RED</span>
          </div>
          <div className="flex mt-1 gap-1">
            {[...Array(MAX_SCORE)].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-sm border border-red-700 ${i < p1.score ? 'bg-red-500' : 'bg-gray-800'}`}></div>
            ))}
          </div>
          <span className="text-xs text-gray-500 mt-1">{p1.stance}</span>
        </div>

        <div className="flex flex-col items-center">
            <div className="bg-black px-4 py-2 rounded text-center min-w-[200px] border border-gray-700 shadow-inner">
                <p className="text-xs text-gray-400 uppercase">Judge Commentary</p>
                <p className="text-yellow-400 text-sm font-bold mt-1 italic min-h-[1.5rem]">
                   {loadingCommentary ? "Thinking..." : commentary || "..."}
                </p>
            </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
             <span className="font-bold text-xl tracking-widest">WHITE</span>
             <span className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
          </div>
          <div className="flex mt-1 gap-1">
             {[...Array(MAX_SCORE)].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-sm border border-gray-500 ${i < cpu.score ? 'bg-white' : 'bg-gray-800'}`}></div>
            ))}
          </div>
          <span className="text-xs text-gray-500 mt-1">{cpu.stance}</span>
        </div>
      </header>

      {/* Main Visual Area (50% height approx) */}
      <main className="flex-grow relative bg-[#1a1a1a] flex items-center justify-center overflow-hidden border-b-4 border-[#2a2a2a]">
         {/* Dojo Floor Texture Effect */}
         <div className="absolute inset-0 opacity-10 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.1)_25%,rgba(255,255,255,.1)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.1)_75%,rgba(255,255,255,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.1)_25%,rgba(255,255,255,.1)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.1)_75%,rgba(255,255,255,.1)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]"></div>
         
         {/* Game Info Overlay */}
         {turnResult && animating && (
           <div className="absolute top-10 z-20 text-center w-full animate-fadeIn">
              <div className="inline-block bg-black/70 px-6 py-2 rounded backdrop-blur">
                 <p className="text-white text-lg font-bold">{turnResult.narrative}</p>
                 <p className="text-sm text-gray-400 mt-1">{turnResult.reason}</p>
              </div>
           </div>
         )}

         <div className="relative z-10 flex justify-center items-end gap-16 md:gap-32 translate-y-10">
            <KendoSprite 
              color="red" 
              stance={p1.stance} 
              action={phase === GamePhase.RESOLUTION ? turnResult?.p1Action || null : null}
              isHit={phase === GamePhase.RESOLUTION && turnResult?.winner === 'cpu'}
              isWinner={phase === GamePhase.RESOLUTION && turnResult?.winner === 'p1' && !!turnResult.ippon}
            />
            <KendoSprite 
              color="white" 
              stance={cpu.stance} 
              action={phase === GamePhase.RESOLUTION ? turnResult?.cpuAction || null : null}
              isHit={phase === GamePhase.RESOLUTION && turnResult?.winner === 'p1'}
              isWinner={phase === GamePhase.RESOLUTION && turnResult?.winner === 'cpu' && !!turnResult.ippon}
            />
         </div>
      </main>

      {/* Controls */}
      <footer className="h-[45%] bg-[#0f0f0f] p-4">
        {phase === GamePhase.GAME_OVER ? (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn">
              <Trophy className={`w-24 h-24 ${p1.score > cpu.score ? 'text-yellow-400' : 'text-gray-600'}`} />
              <h2 className="text-4xl font-bold text-white pixel-font">
                 {p1.score > cpu.score ? "YOU WIN" : "DEFEAT"}
              </h2>
              <p className="text-xl text-gray-400">
                 {p1.score} - {cpu.score}
              </p>
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                PLAY AGAIN
              </button>
           </div>
        ) : (
           <div className="h-full flex flex-col md:flex-row gap-4 max-w-5xl mx-auto">
              <div className="flex-1 h-full">
                 <ActionMenu 
                   stance={p1.stance || Stance.CHUDAN} 
                   onSelectMove={handleMoveSelect} 
                   disabled={phase !== GamePhase.COMBAT}
                 />
              </div>
              <div className="hidden md:block w-64 bg-gray-800 rounded p-4 text-xs text-gray-400 overflow-y-auto border border-gray-700">
                 <h3 className="font-bold text-gray-200 mb-2 flex items-center gap-2">
                   <Info className="w-3 h-3"/> Guide
                 </h3>
                 <ul className="space-y-2 list-disc pl-4">
                    <li><strong>Men:</strong> Standard head strike. Fast.</li>
                    <li><strong>Kote:</strong> Wrist strike. Good vs High stance.</li>
                    <li><strong>Do:</strong> Torso strike. Can dodge Men.</li>
                    <li><strong>Debana:</strong> Counter-attack at the start of opponent's move.</li>
                    <li><strong>Nuki/Kaeshi:</strong> Dodge/Parry then strike.</li>
                 </ul>
                 <div className="mt-4 p-2 bg-gray-900 rounded border border-gray-700">
                    <p className="text-yellow-500 font-bold mb-1 flex items-center gap-1">
                       <AlertCircle className="w-3 h-3"/> Strategy
                    </p>
                    <p>If enemy attacks Men, use Debana-Men or Nuki-Do!</p>
                 </div>
              </div>
           </div>
        )}
      </footer>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1a1a1a] text-white font-sans selection:bg-red-500 selection:text-white">
      {phase === GamePhase.STANCE_SELECTION ? renderStanceSelection() : renderCombat()}
    </div>
  );
};

export default App;
